# 📧 E-Mail-Service Einrichtung

Da Netlify Functions **keine direkten SMTP-Verbindungen** zulassen, verwenden wir stattdessen API-basierte E-Mail-Services. Wählen Sie eine der folgenden Optionen:

---

## ✅ Option 1: SendGrid (Empfohlen)

**Vorteile:**
- ✅ 100 E-Mails/Tag **kostenlos**
- ✅ Sehr zuverlässig
- ✅ Einfache Integration
- ✅ Keine Kreditkarte für kostenlosen Plan

### Schritt-für-Schritt Anleitung:

#### 1. SendGrid Account erstellen

1. Gehen Sie zu [SendGrid](https://signup.sendgrid.com/)
2. Klicken Sie auf **"Start for free"**
3. Registrieren Sie sich mit Ihrer E-Mail-Adresse
4. Bestätigen Sie Ihre E-Mail-Adresse
5. Füllen Sie das Onboarding-Formular aus

#### 2. API-Schlüssel erstellen

1. Loggen Sie sich bei SendGrid ein
2. Gehen Sie zu **"Settings"** → **"API Keys"** im linken Menü
3. Klicken Sie auf **"Create API Key"**
4. Name: `Netlify E-Mail Assistent`
5. Permissions: Wählen Sie **"Restricted Access"**
6. Unter **"Mail Send"**: Setzen Sie auf **"Full Access"**
7. Klicken Sie auf **"Create & View"**
8. **Kopieren Sie den API-Schlüssel sofort** (wird nur einmal angezeigt!)

#### 3. Absender-Adresse verifizieren

**Wichtig:** SendGrid erfordert, dass Sie die Absender-Adresse verifizieren!

1. Gehen Sie zu **"Settings"** → **"Sender Authentication"**
2. Klicken Sie auf **"Verify a Single Sender"**
3. Geben Sie ein:
   - **From Name**: E-Mail Assistent
   - **From Email Address**: `laola@baederbook.de`
   - Füllen Sie die anderen Felder aus
4. Klicken Sie auf **"Create"**
5. Sie erhalten eine Bestätigungs-E-Mail an `laola@baederbook.de`
6. **Öffnen Sie die E-Mail** und klicken Sie auf den Bestätigungslink

#### 4. In Netlify konfigurieren

1. Gehen Sie zu Ihrem [Netlify Dashboard](https://app.netlify.com)
2. Wählen Sie Ihr Projekt (aiagent)
3. **"Site settings"** → **"Environment variables"**
4. Fügen Sie hinzu:

```
SENDGRID_API_KEY = [Ihr kopierter API-Schlüssel]
```

5. Klicken Sie auf **"Save"**
6. Gehen Sie zu **"Deploys"** → **"Trigger deploy"** → **"Clear cache and deploy site"**

#### 5. Fertig! ✅

Nach dem Deployment funktioniert der E-Mail-Versand!

---

## ✅ Option 2: Mailgun

**Vorteile:**
- ✅ 5.000 E-Mails/Monat für 3 Monate kostenlos
- ✅ Danach: 1.000 E-Mails/Monat kostenlos
- ✅ Sehr professionell

### Anleitung:

#### 1. Mailgun Account erstellen

1. Gehen Sie zu [Mailgun](https://www.mailgun.com/)
2. Klicken Sie auf **"Sign Up"**
3. Registrieren Sie sich (benötigt Kreditkarte, wird aber nicht belastet)

#### 2. Domain einrichten

1. Loggen Sie sich ein
2. Gehen Sie zu **"Sending"** → **"Domains"**
3. Wählen Sie Ihre Sandbox-Domain (z.B. `sandboxXXX.mailgun.org`)
4. Oder fügen Sie Ihre eigene Domain hinzu

#### 3. API-Schlüssel finden

1. Gehen Sie zu **"Settings"** → **"API Keys"**
2. Kopieren Sie den **"Private API key"**

#### 4. Autorisierte Empfänger (nur für Sandbox)

Wenn Sie die Sandbox-Domain verwenden:
1. Gehen Sie zu **"Sending"** → **"Domains"** → Ihre Sandbox-Domain
2. Scrollen Sie zu **"Authorized Recipients"**
3. Fügen Sie `christof.drost@landau.de` hinzu
4. Bestätigen Sie die E-Mail

#### 5. In Netlify konfigurieren

```
MAILGUN_API_KEY = [Ihr Private API Key]
MAILGUN_DOMAIN = [Ihre Domain, z.B. sandboxXXX.mailgun.org]
```

---

## ✅ Option 3: SMTP2GO

**Vorteile:**
- ✅ 1.000 E-Mails/Monat kostenlos
- ✅ Keine Kreditkarte erforderlich
- ✅ Einfache Einrichtung

### Anleitung:

#### 1. SMTP2GO Account erstellen

1. Gehen Sie zu [SMTP2GO](https://www.smtp2go.com/)
2. Klicken Sie auf **"Sign Up Free"**
3. Registrieren Sie sich

#### 2. API-Schlüssel erstellen

1. Loggen Sie sich ein
2. Gehen Sie zu **"Settings"** → **"API Keys"**
3. Klicken Sie auf **"Add API Key"**
4. Name: `Netlify Email Assistant`
5. Permissions: **"Send Email"**
6. Klicken Sie auf **"Create"**
7. Kopieren Sie den API-Schlüssel

#### 3. Absender verifizieren

1. Gehen Sie zu **"Settings"** → **"Verified Senders"**
2. Fügen Sie `laola@baederbook.de` hinzu
3. Bestätigen Sie die E-Mail

#### 4. In Netlify konfigurieren

```
SMTP2GO_API_KEY = [Ihr API-Schlüssel]
```

---

## 🔄 Service wechseln

Der Code unterstützt alle drei Services! Die Priorität ist:

1. **SendGrid** (wenn `SENDGRID_API_KEY` gesetzt ist)
2. **Mailgun** (wenn `MAILGUN_API_KEY` + `MAILGUN_DOMAIN` gesetzt sind)
3. **SMTP2GO** (wenn `SMTP2GO_API_KEY` gesetzt ist)

Sie können einfach zwischen den Services wechseln, indem Sie die entsprechenden Umgebungsvariablen in Netlify setzen.

---

## 💡 Meine Empfehlung

**Für den Start: SendGrid**

Warum?
- ✅ 100 E-Mails/Tag reichen für die meisten Anwendungsfälle
- ✅ Keine Kreditkarte erforderlich
- ✅ Sehr zuverlässig
- ✅ Einfaches Setup

**Für später (bei vielen E-Mails): Mailgun**
- Professioneller Service
- Bessere Statistiken
- Mehr Features

---

## 🧪 Testen

Nach der Konfiguration:

1. Warten Sie, bis Netlify neu deployed hat
2. Öffnen Sie Ihre App
3. Generieren Sie einen Antwortentwurf
4. Klicken Sie auf einen der Versand-Buttons
5. Überprüfen Sie, ob die E-Mail angekommen ist

---

## ❓ Problemlösung

### "Kein E-Mail-Service konfiguriert"
→ Sie haben noch keinen API-Schlüssel in Netlify gesetzt

### "SendGrid Fehler: ..."
→ Haben Sie die Absender-Adresse verifiziert?
→ Ist der API-Schlüssel korrekt?

### "Mailgun Fehler: ..."
→ Für Sandbox: Haben Sie den Empfänger autorisiert?
→ Ist die Domain korrekt?

### E-Mail kommt nicht an
→ Überprüfen Sie den Spam-Ordner
→ Schauen Sie in die Netlify Function Logs

---

## 📊 Kosten-Übersicht

| Service | Kostenlos | Danach |
|---------|-----------|--------|
| **SendGrid** | 100/Tag | $15/Monat für 40k |
| **Mailgun** | 1.000/Monat | $35/Monat für 50k |
| **SMTP2GO** | 1.000/Monat | $10/Monat für 10k |

Für normale Nutzung reichen die kostenlosen Pläne völlig aus! 🎉

---

## 🆘 Brauchen Sie Hilfe?

Falls etwas nicht funktioniert:
1. Überprüfen Sie die Netlify Function Logs
2. Stellen Sie sicher, dass alle Umgebungsvariablen gesetzt sind
3. Prüfen Sie, ob die Absender-Adresse verifiziert ist
4. Testen Sie mit einer anderen E-Mail-Adresse

