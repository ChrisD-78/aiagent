const { simpleParser } = require('mailparser');
const fetch = require('node-fetch');

// SendGrid Inbound Parse Webhook
exports.handler = async (event, context) => {
  console.log('Received email webhook from SendGrid');

  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Nur POST akzeptieren
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // SendGrid sendet die E-Mail als multipart/form-data
    // Das body ist entweder form-encoded oder enthält die E-Mail-Daten
    
    const body = event.body;
    const isBase64 = event.isBase64Encoded;
    
    let parsedBody;
    
    // Parse form data
    if (body) {
      // Decode wenn Base64
      const decodedBody = isBase64 ? Buffer.from(body, 'base64').toString('utf-8') : body;
      
      // Parse URL-encoded form data
      parsedBody = parseFormData(decodedBody);
      
      console.log('Parsed form fields:', Object.keys(parsedBody));
    }

    // SendGrid sendet verschiedene Felder
    const from = parsedBody.from || 'Unbekannt';
    const subject = parsedBody.subject || 'Kein Betreff';
    const text = parsedBody.text || parsedBody.html || '';
    const to = parsedBody.to || '';
    
    console.log(`Email received - From: ${from}, Subject: ${subject}, To: ${to}`);

    // Speichere die E-Mail (wir verwenden eine einfache In-Memory-Lösung für jetzt)
    // In einer Produktionsumgebung würde man eine Datenbank verwenden
    
    // Generiere automatisch eine Antwort
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      console.log('No OpenAI key configured, storing email without generating response');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Email received but no OpenAI key configured'
        })
      };
    }

    // Generiere Antwort
    try {
      const response = await generateResponse(text, openaiKey);
      
      console.log('Response generated successfully');
      
      // Hier könnten wir die E-Mail + Antwort in einer Datenbank speichern
      // Für jetzt loggen wir sie nur
      
      // Optional: Speichere in einer externen Datenbank oder sende Benachrichtigung
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Email received and response generated',
          from: from,
          subject: subject,
          response: response.substring(0, 100) + '...' // Gekürzt für Log
        })
      };
      
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        statusCode: 200, // Trotzdem 200 zurückgeben, damit SendGrid nicht retried
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Email received but response generation failed',
          error: error.message
        })
      };
    }

  } catch (error) {
    console.error('Error processing email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error processing email: ' + error.message 
      })
    };
  }
};

// Parse URL-encoded form data
function parseFormData(body) {
  const params = new URLSearchParams(body);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
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

