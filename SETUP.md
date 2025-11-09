# 🔧 Setup-Anleitung für den automatischen E-Mail-Assistenten

## 📧 E-Mail-Konfiguration (United Domains)

### Schritt 1: E-Mail-Zugangsdaten ermitteln

Für **laola@baederbook.de** benötigen Sie:

- **E-Mail-Adresse**: laola@baederbook.de
- **Passwort**: Ihr E-Mail-Passwort
- **IMAP-Server**: imap.united-domains.de
- **IMAP-Port**: 993 (SSL/TLS)

### Schritt 2: IMAP in United Domains aktivieren

1. Loggen Sie sich bei [United Domains](https://www.united-domains.de) ein
2. Gehen Sie zu Ihrem E-Mail-Postfach
3. Stellen Sie sicher, dass IMAP aktiviert ist (normalerweise standardmäßig aktiv)

## 🚀 Netlify-Konfiguration

### Umgebungsvariablen setzen

Nach dem Deployment auf Netlify müssen Sie folgende Umgebungsvariablen konfigurieren:

1. Gehen Sie zu Ihrem Netlify-Dashboard
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **"Site settings"** → **"Environment variables"**
4. Fügen Sie folgende Variablen hinzu:

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `EMAIL_USER` | `laola@baederbook.de` | E-Mail-Adresse (für Empfang + Absender) |
| `EMAIL_PASSWORD` | `Ihr-Passwort` | E-Mail-Passwort (nur für IMAP-Empfang) |
| `EMAIL_HOST` | `imap.united-domains.de` | IMAP-Server (für Empfang) |
| `EMAIL_PORT` | `993` | IMAP-Port (für Empfang) |
| `OPENAI_API_KEY` | `sk-...` | Ihr OpenAI API-Schlüssel |
| `SENDGRID_API_KEY` | `SG.xxx...` | SendGrid API-Schlüssel (für Versand) |

**Wichtig für E-Mail-Versand:** Siehe [EMAIL-SERVICE-SETUP.md](EMAIL-SERVICE-SETUP.md) für detaillierte Anleitung zur Einrichtung von SendGrid, Mailgun oder SMTP2GO.

### Wichtige Hinweise zur Sicherheit

⚠️ **Niemals** Passwörter direkt im Code speichern!
✅ Nutzen Sie immer die Netlify-Umgebungsvariablen
🔒 Die Variablen sind nur auf dem Server verfügbar und nicht öffentlich einsehbar

## 📱 Lokale Entwicklung

Für lokale Tests erstellen Sie eine `.env` Datei im Hauptverzeichnis:

```env
EMAIL_USER=laola@baederbook.de
EMAIL_PASSWORD=ihr-passwort
EMAIL_HOST=imap.united-domains.de
EMAIL_PORT=993
OPENAI_API_KEY=sk-...
```

Dann installieren Sie die Dependencies und starten den Dev-Server:

```bash
npm install
npm run dev
```

Die App läuft dann auf: `http://localhost:8888`

## 🔄 Automatischer E-Mail-Abruf

### Manueller Abruf

Öffnen Sie das Dashboard und klicken Sie auf "E-Mails abrufen".

### Automatischer Abruf (Cron-Job)

Für regelmäßigen automatischen Abruf können Sie verschiedene Optionen nutzen:

**Option 1: Netlify Scheduled Functions** (erfordert Pro-Plan)
- Konfigurieren Sie einen Cron-Job in `netlify.toml`

**Option 2: Externe Cron-Services** (kostenlos)
- [Cron-Job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- Rufen Sie regelmäßig Ihre Function-URL auf

**Option 3: GitHub Actions** (kostenlos)
- Erstellen Sie einen GitHub Action Workflow
- Dieser ruft Ihre Netlify Function regelmäßig auf

Beispiel für einen externen Cron-Job:
- **URL**: `https://ihre-app.netlify.app/.netlify/functions/check-emails`
- **Intervall**: Alle 15 Minuten
- **Methode**: GET

## 🧪 Testing

### E-Mail-Verbindung testen

1. Öffnen Sie `https://ihre-app.netlify.app/dashboard.html`
2. Klicken Sie auf "E-Mails abrufen"
3. Bei Fehlern prüfen Sie:
   - Sind die Umgebungsvariablen korrekt gesetzt?
   - Ist das E-Mail-Passwort richtig?
   - Ist IMAP bei United Domains aktiviert?

### Fehlerdiagnose

Netlify-Logs anzeigen:
1. Netlify Dashboard → Ihr Projekt
2. "Functions" Tab
3. Klicken Sie auf "check-emails"
4. Schauen Sie sich die Logs an

## 📊 Features

### ✅ Aktuell verfügbar

- ✓ Manuelle E-Mail-Eingabe und Antworterstellung
- ✓ Automatischer IMAP-E-Mail-Abruf
- ✓ KI-gestützte Antworterstellung
- ✓ Dashboard mit Übersicht
- ✓ Kopieren-Funktion für Antworten
- ✓ Mobiloptimiert

### 🚧 Geplante Erweiterungen

- ⏰ Automatischer zeitgesteuerter Abruf
- 📤 Automatisches Versenden von Antworten
- 📝 Entwürfe speichern und bearbeiten
- 🏷️ E-Mail-Kategorisierung
- 📈 Statistiken und Analytics
- 🔔 E-Mail-Benachrichtigungen

## 🆘 Support

Bei Problemen:

1. Überprüfen Sie die Netlify Function Logs
2. Testen Sie die E-Mail-Verbindung separat
3. Prüfen Sie alle Umgebungsvariablen
4. Stellen Sie sicher, dass Ihr OpenAI-Guthaben ausreicht

## 📞 United Domains E-Mail-Einstellungen

### IMAP (Empfang):
- **IMAP-Server**: imap.united-domains.de
- **Port**: 993
- **Verschlüsselung**: SSL/TLS
- **Benutzername**: Vollständige E-Mail-Adresse (laola@baederbook.de)
- **Passwort**: Ihr E-Mail-Passwort

Falls IMAP nicht funktioniert, kontaktieren Sie den United Domains Support.

### E-Mail-Versand:
Für den E-Mail-Versand verwenden wir **nicht** den United Domains SMTP-Server (Netlify blockiert SMTP-Verbindungen), sondern einen API-basierten E-Mail-Service wie SendGrid.

**→ Siehe [EMAIL-SERVICE-SETUP.md](EMAIL-SERVICE-SETUP.md) für die komplette Einrichtungsanleitung!**

