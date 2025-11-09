// DOM Elemente
const refreshBtn = document.getElementById('refreshBtn');
const loader = document.getElementById('loader');
const emailContainer = document.getElementById('emailContainer');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const stats = document.getElementById('stats');
const totalCount = document.getElementById('totalCount');
const successCount = document.getElementById('successCount');
const errorCount = document.getElementById('errorCount');

// E-Mails abrufen
refreshBtn.addEventListener('click', async () => {
    await fetchEmails();
});

// E-Mails von der API abrufen
async function fetchEmails() {
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
    loader.style.display = 'block';
    emailContainer.innerHTML = '';
    emptyState.style.display = 'none';
    stats.style.display = 'none';

    try {
        // Netlify Function aufrufen
        const response = await fetch('/.netlify/functions/check-emails', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fehler beim E-Mail-Abruf');
        }

        const data = await response.json();

        if (data.success && data.emails.length > 0) {
            displayEmails(data.emails);
            updateStats(data.emails);
            showToast(`${data.count} E-Mail(s) erfolgreich abgerufen`, 'success');
        } else {
            emptyState.innerHTML = `
                <div class="empty-state-icon">✅</div>
                <h3>Keine neuen E-Mails</h3>
                <p>Es gibt aktuell keine ungelesenen E-Mails.</p>
            `;
            emptyState.style.display = 'block';
            showToast('Keine neuen E-Mails gefunden', 'info');
        }

    } catch (error) {
        console.error('Fehler:', error);
        showToast(`Fehler: ${error.message}`, 'error');
        emptyState.innerHTML = `
            <div class="empty-state-icon">⚠️</div>
            <h3>Fehler beim E-Mail-Abruf</h3>
            <p>${error.message}</p>
            <p style="margin-top: 1rem; font-size: 0.875rem;">
                Bitte stellen Sie sicher, dass die E-Mail-Zugangsdaten in den Netlify-Umgebungsvariablen konfiguriert sind.
            </p>
        `;
        emptyState.style.display = 'block';
    } finally {
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
        loader.style.display = 'none';
    }
}

// E-Mails anzeigen
function displayEmails(emails) {
    emailContainer.innerHTML = '';
    
    emails.forEach((email, index) => {
        const emailItem = createEmailItem(email, index);
        emailContainer.appendChild(emailItem);
    });
}

// E-Mail-Element erstellen
function createEmailItem(email, index) {
    const div = document.createElement('div');
    div.className = 'email-item';
    div.style.animationDelay = `${index * 0.1}s`;

    const statusClass = email.status === 'success' ? 'success' : 'error';
    const statusText = email.status === 'success' ? '✓ Verarbeitet' : '✗ Fehler';

    const formattedDate = new Date(email.date).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="email-header">
            <div class="email-meta">
                <div class="email-subject">${escapeHtml(email.subject)}</div>
                <div class="email-from">Von: ${escapeHtml(email.from)}</div>
                <div class="email-date">${formattedDate}</div>
            </div>
            <div class="email-status ${statusClass}">${statusText}</div>
        </div>

        <div class="email-content">
            <div class="section-title">
                <span>📩</span>
                <span>Originalnachricht</span>
            </div>
            <div class="email-text">${escapeHtml(email.originalText).replace(/\n/g, '<br>')}</div>

            ${email.status === 'success' ? `
                <div class="section-title">
                    <span>✉️</span>
                    <span>Vorbereiteter Antwortentwurf</span>
                </div>
                <div class="email-response" id="response-${index}">${escapeHtml(email.generatedResponse)}</div>
                <div class="response-actions">
                    <button class="btn-small btn-copy" onclick="copyResponse(${index})">
                        📋 Antwort kopieren
                    </button>
                    <button class="btn-small btn-edit" onclick="openManualEditor('${escapeHtml(email.originalText)}')">
                        ✏️ Manuell bearbeiten
                    </button>
                </div>
            ` : `
                <div class="section-title">
                    <span>⚠️</span>
                    <span>Fehler bei der Verarbeitung</span>
                </div>
                <div class="email-text" style="background: #fee2e2; border-color: #ef4444;">
                    ${escapeHtml(email.error || 'Unbekannter Fehler')}
                </div>
            `}
        </div>
    `;

    return div;
}

// Statistiken aktualisieren
function updateStats(emails) {
    const total = emails.length;
    const success = emails.filter(e => e.status === 'success').length;
    const errors = emails.filter(e => e.status === 'error').length;

    totalCount.textContent = total;
    successCount.textContent = success;
    errorCount.textContent = errors;

    stats.style.display = 'flex';
}

// Antwort kopieren
window.copyResponse = async function(index) {
    const responseDiv = document.getElementById(`response-${index}`);
    const text = responseDiv.textContent;

    try {
        await navigator.clipboard.writeText(text);
        showToast('Antwort in Zwischenablage kopiert', 'success');
    } catch (error) {
        showToast('Kopieren fehlgeschlagen', 'error');
    }
};

// Zur manuellen Bearbeitung wechseln
window.openManualEditor = function(emailText) {
    localStorage.setItem('draft_email', emailText);
    window.location.href = 'index.html';
};

// HTML escapen (XSS-Schutz)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toast Benachrichtigung
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Beim Laden prüfen, ob wir von der manuellen Seite kommen
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto') === 'true') {
        fetchEmails();
    }
});

// Tastenkürzel: R zum Aktualisieren
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        if (!refreshBtn.disabled) {
            refreshBtn.click();
        }
    }
});

