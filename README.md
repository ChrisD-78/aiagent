# 📧 E-Mail Assistent

Eine moderne, mobiloptimierte Web-App für professionelle deutschsprachige Geschäftskommunikation. Die App analysiert eingehende E-Mails und erstellt automatisch passende Antwortentwürfe.

## ✨ Features

- 🎯 **Intelligente Analyse**: Erkennt automatisch den Ton und Stil der eingehenden E-Mail
- 📬 **Automatischer E-Mail-Abruf**: Holt automatisch E-Mails per IMAP (z.B. von United Domains)
- 🤖 **KI-gestützte Antworten**: Generiert professionelle Antwortentwürfe mit OpenAI GPT-4
- 📊 **Dashboard**: Übersicht über alle eingehenden E-Mails und deren Antworten
- 📱 **Mobile-First**: Optimiert für Smartphone-Nutzung
- 🎨 **Modernes Design**: Ansprechendes, intuitives Interface
- 🔒 **Datenschutz**: Sichere Verarbeitung mit Netlify Functions
- 🌓 **Dark Mode**: Automatische Anpassung an System-Einstellungen
- ⚡ **Schnell**: Serverless-Architektur für beste Performance

## 🎭 Zwei Modi

### 1. Manueller Modus (`index.html`)
Perfekt zum schnellen Testen oder für einzelne E-Mails:
- E-Mail manuell einfügen
- Sofort Antwortentwurf erhalten
- Keine E-Mail-Konfiguration nötig

### 2. Automatischer Modus (`dashboard.html`)
Für die Integration mit Ihrem E-Mail-Postfach:
- Automatischer IMAP-Abruf
- Verarbeitet alle ungelesenen E-Mails
- Dashboard mit Übersicht
- Ein-Klick-Kopieren der Antworten

## 🚀 Lokale Installation

1. Repository klonen oder Dateien herunterladen:
```bash
git clone <repository-url>
cd AI\ Agent
```

2. Einen lokalen Webserver starten:

**Option A: Python**
```bash
python3 -m http.server 8000
```

**Option B: Node.js (npx)**
```bash
npx serve
```

**Option C: VS Code Live Server**
- Installieren Sie die "Live Server" Extension
- Rechtsklick auf `index.html` → "Open with Live Server"

3. Browser öffnen:
```
http://localhost:8000
```

## 📦 Deployment auf Netlify

### Methode 1: GitHub Integration (empfohlen)

1. **Repository auf GitHub erstellen:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Mit Netlify verbinden:**
   - Gehen Sie zu [netlify.com](https://www.netlify.com)
   - Klicken Sie auf "Add new site" → "Import an existing project"
   - Wählen Sie GitHub und Ihr Repository
   - Build-Einstellungen leer lassen (keine Build-Commands nötig)
   - Klicken Sie auf "Deploy site"

### Methode 2: Netlify Drop

1. Gehen Sie zu [app.netlify.com/drop](https://app.netlify.com/drop)
2. Ziehen Sie den kompletten Projekt-Ordner in den Upload-Bereich
3. Fertig! Ihre App ist sofort online

### Methode 3: Netlify CLI

```bash
# Netlify CLI installieren
npm install -g netlify-cli

# Einloggen
netlify login

# Deployen
netlify deploy --prod
```

## 🔑 OpenAI API-Schlüssel einrichten

1. Besuchen Sie [platform.openai.com](https://platform.openai.com)
2. Erstellen Sie ein Konto oder loggen Sie sich ein
3. Gehen Sie zu "API Keys"
4. Erstellen Sie einen neuen API-Schlüssel
5. Kopieren Sie den Schlüssel und fügen Sie ihn in der App ein

**Hinweis:** Der API-Schlüssel wird nur in Ihrem Browser gespeichert und nicht an andere Server übertragen (außer an OpenAI).

## 💡 Verwendung

### Manueller Modus
1. **API-Schlüssel eingeben**: Fügen Sie Ihren OpenAI API-Schlüssel ein (wird automatisch gespeichert)
2. **E-Mail einfügen**: Kopieren Sie die eingehende E-Mail in das Textfeld
3. **Generieren**: Klicken Sie auf "Antwortentwurf erstellen" oder drücken Sie Strg/Cmd + Enter
4. **Kopieren**: Nutzen Sie den "Kopieren"-Button, um den Entwurf in Ihre E-Mail-App zu übertragen

### Automatischer Modus (Dashboard)
1. **Konfiguration**: Siehe [SETUP.md](SETUP.md) für detaillierte Anweisungen
2. **E-Mail-Zugangsdaten**: Konfigurieren Sie Ihre E-Mail-Zugangsdaten in Netlify
3. **Dashboard öffnen**: Navigieren Sie zu `/dashboard.html`
4. **E-Mails abrufen**: Klicken Sie auf "E-Mails abrufen"
5. **Antworten nutzen**: Alle generierten Antworten werden übersichtlich angezeigt

## 🛠️ Technologie-Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **API**: OpenAI GPT-4
- **Hosting**: Netlify-kompatibel
- **Design**: Responsive, Mobile-First, CSS Grid & Flexbox

## 📱 Browser-Kompatibilität

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Browser (iOS Safari, Chrome Mobile)

## 🔧 Anpassungen

### Design ändern

Farben und Styling können in der `style.css` angepasst werden. Die CSS-Variablen finden Sie am Anfang der Datei:

```css
:root {
    --primary-color: #2563eb;
    --primary-hover: #1d4ed8;
    /* ... weitere Variablen */
}
```

### Prompt anpassen

Der System-Prompt kann in der `script.js` in der Funktion `generateEmailResponse()` angepasst werden.

## 📄 Projektstruktur

```
AI Agent/
│
├── index.html          # Haupt-HTML-Datei
├── style.css           # Styling und Design
├── script.js           # App-Logik und API-Integration
├── README.md           # Diese Datei
└── netlify.toml        # Netlify-Konfiguration (optional)
```

## 🤝 Support

Bei Fragen oder Problemen:
- Überprüfen Sie die Browser-Konsole auf Fehlermeldungen
- Stellen Sie sicher, dass Ihr API-Schlüssel gültig ist
- Prüfen Sie Ihre Internetverbindung

## 📝 Lizenz

Dieses Projekt steht zur freien Verwendung zur Verfügung.

---

Entwickelt mit ❤️ für professionelle deutschsprachige Geschäftskommunikation

