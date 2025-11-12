// Sprachsteuerung für E-Mail Assistent
class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.synth = window.speechSynthesis;
        
        this.initRecognition();
    }

    // Speech Recognition initialisieren
    initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech Recognition nicht unterstützt');
            return false;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.lang = 'de-DE';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        return true;
    }

    // Spracherkennung starten
    startListening(mode = 'dictate', callback) {
        if (!this.recognition) {
            showToast('Spracherkennung nicht verfügbar in diesem Browser', 'error');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        this.isListening = true;
        
        this.recognition.onstart = () => {
            console.log('Spracherkennung gestartet');
            if (callback && callback.onStart) callback.onStart();
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Erkannt:', transcript);
            
            if (mode === 'command') {
                this.handleCommand(transcript);
            } else {
                if (callback && callback.onResult) callback.onResult(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Spracherkennungsfehler:', event.error);
            this.isListening = false;
            
            let errorMessage = 'Fehler bei der Spracherkennung';
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'Keine Sprache erkannt. Bitte versuchen Sie es erneut.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Kein Mikrofon gefunden oder Zugriff verweigert.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Mikrofonzugriff wurde verweigert. Bitte erlauben Sie den Zugriff.';
                    break;
            }
            
            showToast(errorMessage, 'error');
            if (callback && callback.onError) callback.onError(event.error);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Spracherkennung beendet');
            if (callback && callback.onEnd) callback.onEnd();
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Fehler beim Start:', error);
            this.isListening = false;
            showToast('Spracherkennung konnte nicht gestartet werden', 'error');
        }
    }

    // Spracherkennung stoppen
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // Sprachbefehle verarbeiten
    handleCommand(text) {
        const command = text.toLowerCase();
        console.log('Befehl:', command);

        // Antwortentwurf erstellen
        if (command.includes('antwort erstellen') || 
            command.includes('antwort generieren') ||
            command.includes('entwurf erstellen')) {
            
            this.speak('Erstelle Antwortentwurf');
            document.getElementById('generateBtn')?.click();
        }
        
        // E-Mail senden
        else if (command.includes('senden') || command.includes('abschicken')) {
            if (command.includes('christof') || command.includes('automatisch')) {
                this.speak('Sende E-Mail automatisch');
                document.getElementById('sendAutoBtn')?.click();
            } else {
                this.speak('Bitte geben Sie zuerst eine E-Mail-Adresse ein');
                document.getElementById('recipientEmail')?.focus();
            }
        }
        
        // Kopieren
        else if (command.includes('kopieren') || command.includes('kopiere')) {
            this.speak('Kopiere in Zwischenablage');
            document.getElementById('copyBtn')?.click();
        }
        
        // Löschen / Neu anfangen
        else if (command.includes('löschen') || 
                 command.includes('neu anfangen') ||
                 command.includes('zurücksetzen')) {
            this.speak('Lösche Eingabe');
            document.getElementById('emailInput').value = '';
            document.getElementById('resultCard').style.display = 'none';
        }
        
        // Hilfe
        else if (command.includes('hilfe') || command.includes('was kannst du')) {
            this.speak('Sie können sagen: Antwort erstellen, Senden, Kopieren, oder Löschen');
            showToast('Verfügbare Befehle: "Antwort erstellen", "Senden", "Kopieren", "Löschen"', 'info');
        }
        
        // Befehl nicht erkannt
        else {
            this.speak('Befehl nicht erkannt. Sagen Sie Hilfe für verfügbare Befehle.');
            showToast('Befehl nicht erkannt. Verfügbare Befehle: "Antwort erstellen", "Senden", "Kopieren"', 'error');
        }
    }

    // Text vorlesen (Text-to-Speech)
    speak(text, language = 'de-DE') {
        if (this.isSpeaking) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            this.isSpeaking = true;
        };

        utterance.onend = () => {
            this.isSpeaking = false;
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
        };

        this.synth.speak(utterance);
    }

    // Sprache stoppen
    stopSpeaking() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
    }

    // Verfügbarkeit prüfen
    isAvailable() {
        return this.recognition !== null;
    }
}

// Globale Instanz
const voiceAssistant = new VoiceAssistant();

