// DOM Elemente
const emailInput = document.getElementById('emailInput');
const generateBtn = document.getElementById('generateBtn');
const resultCard = document.getElementById('resultCard');
const emailOutput = document.getElementById('emailOutput');
const loader = document.getElementById('loader');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');
const recipientEmail = document.getElementById('recipientEmail');
const sendCustomBtn = document.getElementById('sendCustomBtn');
const sendAutoBtn = document.getElementById('sendAutoBtn');

// Antwortentwurf generieren
generateBtn.addEventListener('click', async () => {
    const emailText = emailInput.value.trim();

    // Validierung
    if (!emailText) {
        showToast('Bitte fügen Sie eine E-Mail ein', 'error');
        emailInput.focus();
        return;
    }

    // UI Update
    generateBtn.disabled = true;
    loader.style.display = 'block';
    resultCard.style.display = 'none';

    try {
        const response = await generateEmailResponse(emailText);
        displayResult(response);
        showToast('Antwortentwurf erfolgreich erstellt', 'success');
    } catch (error) {
        console.error('Fehler:', error);
        showToast(`Fehler: ${error.message}`, 'error');
    } finally {
        generateBtn.disabled = false;
        loader.style.display = 'none';
    }
});

// Netlify Function aufrufen
async function generateEmailResponse(emailText) {
    const response = await fetch('/.netlify/functions/generate-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            emailText: emailText
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler bei der Antworterstellung');
    }

    const data = await response.json();
    return data.response;
}

// Ergebnis anzeigen
function displayResult(text) {
    emailOutput.value = text;
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// In Zwischenablage kopieren
copyBtn.addEventListener('click', async () => {
    const text = emailOutput.value;
    try {
        await navigator.clipboard.writeText(text);
        showToast('In Zwischenablage kopiert', 'success');
        copyBtn.innerHTML = '<span>✓</span> Kopiert';
        setTimeout(() => {
            copyBtn.innerHTML = '<span>📋</span> Kopieren';
        }, 2000);
    } catch (error) {
        showToast('Kopieren fehlgeschlagen', 'error');
    }
});

// E-Mail an benutzerdefinierte Adresse senden
sendCustomBtn.addEventListener('click', async () => {
    const recipient = recipientEmail.value.trim();
    const message = emailOutput.value.trim();

    if (!recipient) {
        showToast('Bitte geben Sie eine E-Mail-Adresse ein', 'error');
        recipientEmail.focus();
        return;
    }

    if (!message) {
        showToast('Keine Nachricht zum Senden vorhanden', 'error');
        return;
    }

    await sendEmail(recipient, message, sendCustomBtn);
});

// E-Mail automatisch an christof.drost@landau.de senden
sendAutoBtn.addEventListener('click', async () => {
    const message = emailOutput.value.trim();

    if (!message) {
        showToast('Keine Nachricht zum Senden vorhanden', 'error');
        return;
    }

    await sendEmail('christof.drost@landau.de', message, sendAutoBtn);
});

// E-Mail-Versand-Funktion
async function sendEmail(to, message, button) {
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span>⏳</span> Wird gesendet...';

    try {
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: to,
                subject: 'Antwort von E-Mail Assistent',
                message: message
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim E-Mail-Versand');
        }

        const data = await response.json();
        showToast(`E-Mail erfolgreich an ${to} gesendet! ✅`, 'success');
        button.innerHTML = '<span>✓</span> Gesendet';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }, 3000);
    } catch (error) {
        console.error('Fehler beim E-Mail-Versand:', error);
        showToast(`Fehler beim Senden: ${error.message}`, 'error');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

// Toast Benachrichtigung anzeigen
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Strg/Cmd + Enter zum Generieren
emailInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateBtn.click();
    }
});

