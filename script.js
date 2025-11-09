// DOM Elemente
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const emailInput = document.getElementById('emailInput');
const generateBtn = document.getElementById('generateBtn');
const resultCard = document.getElementById('resultCard');
const emailOutput = document.getElementById('emailOutput');
const loader = document.getElementById('loader');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');

// API-Schlüssel aus LocalStorage laden
window.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
});

// API-Schlüssel Sichtbarkeit umschalten
toggleApiKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleApiKeyBtn.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        toggleApiKeyBtn.textContent = '👁️';
    }
});

// API-Schlüssel speichern
apiKeyInput.addEventListener('change', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
        showToast('API-Schlüssel gespeichert', 'success');
    }
});

// Antwortentwurf generieren
generateBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const emailText = emailInput.value.trim();

    // Validierung
    if (!apiKey) {
        showToast('Bitte geben Sie Ihren OpenAI API-Schlüssel ein', 'error');
        apiKeyInput.focus();
        return;
    }

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
        const response = await generateEmailResponse(apiKey, emailText);
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

// OpenAI API Aufruf
async function generateEmailResponse(apiKey, emailText) {
    const systemPrompt = `Du bist ein professioneller E-Mail-Assistent für deutschsprachige Geschäftskommunikation.

Deine Hauptaufgabe ist es, eingehende E-Mails zu analysieren und einen passenden Antwortentwurf vorzubereiten.

Richtlinien:
1. Verwende immer korrekte Rechtschreibung und Grammatik.
2. Formuliere klar, höflich und professionell.
3. Passe den Ton an den Absender an:
   - Wenn der Absender formell schreibt → du antwortest formell.
   - Wenn der Absender locker schreibt → du bleibst freundlich und natürlich.
4. Antworte nur auf das, was inhaltlich relevant ist; vermeide Wiederholungen oder irrelevante Höflichkeiten.
5. Wenn eine Handlung erforderlich ist (z. B. Terminbestätigung, Rückfrage, Weiterleitung), schlage klar formulierte nächste Schritte vor.
6. Füge eine passende Grußformel am Ende hinzu.
7. Verwende kein Markdown, keine Listen, kein HTML — nur reinen Fließtext, sendefertig für eine E-Mail.

Wenn Informationen fehlen, schreibe eine höfliche Rückfrage, anstatt Annahmen zu treffen.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Bitte erstelle einen Antwortentwurf für folgende E-Mail:\n\n${emailText}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API-Anfrage fehlgeschlagen');
    }

    const data = await response.json();
    return data.choices[0].message.content;
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

// Enter-Taste im API-Schlüssel Feld
apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        emailInput.focus();
    }
});

// Strg/Cmd + Enter zum Generieren
emailInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateBtn.click();
    }
});

