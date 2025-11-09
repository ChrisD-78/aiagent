// DOM Elemente
const emailInput = document.getElementById('emailInput');
const generateBtn = document.getElementById('generateBtn');
const resultCard = document.getElementById('resultCard');
const emailOutput = document.getElementById('emailOutput');
const loader = document.getElementById('loader');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');

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
    emailOutput.textContent = text;
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// In Zwischenablage kopieren
copyBtn.addEventListener('click', async () => {
    const text = emailOutput.textContent;
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

