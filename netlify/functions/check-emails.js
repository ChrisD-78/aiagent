const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // E-Mail-Konfiguration aus Umgebungsvariablen
    const emailConfig = {
      user: process.env.EMAIL_USER || 'laola@baederbook.de',
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST || 'imap.united-domains.de',
      port: parseInt(process.env.EMAIL_PORT || '993'),
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    };

    if (!emailConfig.password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'E-Mail-Passwort nicht konfiguriert. Bitte EMAIL_PASSWORD Umgebungsvariable setzen.' 
        })
      };
    }

    // E-Mails abrufen
    const emails = await fetchEmails(emailConfig);
    
    // OpenAI API-Schlüssel
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'OpenAI API-Schlüssel nicht konfiguriert. Bitte OPENAI_API_KEY Umgebungsvariable setzen.' 
        })
      };
    }

    // Antworten für jede E-Mail generieren
    const results = [];
    for (const email of emails) {
      try {
        const response = await generateResponse(email.text, openaiKey);
        results.push({
          id: email.id,
          from: email.from,
          subject: email.subject,
          date: email.date,
          originalText: email.text,
          generatedResponse: response,
          status: 'success'
        });
      } catch (error) {
        results.push({
          id: email.id,
          from: email.from,
          subject: email.subject,
          date: email.date,
          originalText: email.text,
          error: error.message,
          status: 'error'
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: results.length,
        emails: results
      })
    };

  } catch (error) {
    console.error('Fehler beim E-Mail-Abruf:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Fehler beim E-Mail-Abruf: ' + error.message 
      })
    };
  }
};

// E-Mails per IMAP abrufen
function fetchEmails(config) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(config);
    const emails = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Hole nur ungelesene E-Mails der letzten 7 Tage
        const searchCriteria = ['UNSEEN', ['SINCE', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]];
        
        imap.search(searchCriteria, (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (results.length === 0) {
            imap.end();
            resolve([]);
            return;
          }

          // Limitiere auf maximal 10 E-Mails pro Abruf
          const limitedResults = results.slice(0, 10);
          const f = imap.fetch(limitedResults, { bodies: '' });

          f.on('message', (msg, seqno) => {
            let buffer = '';
            msg.on('body', (stream, info) => {
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
            });

            msg.once('end', () => {
              simpleParser(buffer, (err, parsed) => {
                if (err) {
                  console.error('Parse-Fehler:', err);
                  return;
                }

                emails.push({
                  id: seqno,
                  from: parsed.from?.text || 'Unbekannt',
                  subject: parsed.subject || 'Kein Betreff',
                  date: parsed.date || new Date(),
                  text: parsed.text || parsed.html || ''
                });
              });
            });
          });

          f.once('error', (err) => {
            reject(err);
          });

          f.once('end', () => {
            imap.end();
          });
        });
      });
    });

    imap.once('error', (err) => {
      reject(err);
    });

    imap.once('end', () => {
      resolve(emails);
    });

    imap.connect();
  });
}

// OpenAI Antwort generieren
async function generateResponse(emailText, apiKey) {
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
    throw new Error(error.error?.message || 'OpenAI API-Anfrage fehlgeschlagen');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

