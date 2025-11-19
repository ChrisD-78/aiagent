// Lola Chat Interface

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

// Enter zum Senden, Shift+Enter für neue Zeile
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Senden-Button
sendBtn.addEventListener('click', sendMessage);

// Sprachsteuerung
if (voiceAssistant && voiceAssistant.isAvailable()) {
    voiceBtn.addEventListener('click', () => {
        if (voiceAssistant.isListening) {
            voiceAssistant.stopListening();
            voiceBtn.classList.remove('listening');
            voiceBtn.textContent = '🎤';
            return;
        }

        voiceAssistant.startListening('dictate', {
            onStart: () => {
                voiceBtn.classList.add('listening');
                voiceBtn.textContent = '⏺️';
                showToast('Sprechen Sie jetzt...', 'info');
            },
            onResult: (transcript) => {
                chatInput.value = transcript;
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px';
                showToast('Text diktiert', 'success');
                // Automatisch senden nach Diktat
                setTimeout(() => sendMessage(), 500);
            },
            onEnd: () => {
                voiceBtn.classList.remove('listening');
                voiceBtn.textContent = '🎤';
            },
            onError: (error) => {
                voiceBtn.classList.remove('listening');
                voiceBtn.textContent = '🎤';
            }
        });
    });
} else {
    voiceBtn.disabled = true;
    voiceBtn.style.opacity = '0.5';
    voiceBtn.title = 'Spracherkennung nicht verfügbar';
}

// Nachricht senden
async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) {
        return;
    }

    // User-Nachricht anzeigen
    addMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Loading-Indikator
    const loadingId = showTypingIndicator();
    
    // Senden-Button deaktivieren
    sendBtn.disabled = true;
    voiceBtn.disabled = true;

    try {
        const response = await fetch('/.netlify/functions/lola-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler bei der Kommunikation mit Lola');
        }

        const data = await response.json();
        
        // Loading entfernen
        removeTypingIndicator(loadingId);
        
        // Lola-Antwort anzeigen
        addMessage(data.response, 'lola');
        
    } catch (error) {
        console.error('Fehler:', error);
        removeTypingIndicator(loadingId);
        addMessage('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', 'lola');
        showToast('Fehler: ' + error.message, 'error');
    } finally {
        sendBtn.disabled = false;
        voiceBtn.disabled = false;
    }
}

// Nachricht zum Chat hinzufügen
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '💬';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    // Welcome-Message entfernen wenn erste Nachricht
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll nach unten
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Typing-Indikator anzeigen
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message lola';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '💬';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return 'typing-indicator';
}

// Typing-Indikator entfernen
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// Quick-Message senden
window.sendQuickMessage = function(message) {
    chatInput.value = message;
    sendMessage();
};

// Toast-Funktion
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initiale Begrüßung nach kurzer Verzögerung
setTimeout(() => {
    if (chatMessages.querySelector('.welcome-message')) {
        addMessage('Hallo Christof! 👋 Ich bin Lola, Ihr persönlicher Assistent. Ich helfe Ihnen gerne bei Fragen zu LA OLA, dem Freibad Landau oder bei anderen geschäftlichen Anliegen. Wie kann ich Ihnen heute helfen?', 'lola');
    }
}, 1000);

