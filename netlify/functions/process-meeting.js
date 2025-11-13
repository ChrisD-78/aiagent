const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Processing meeting recording...');
    
    // OpenAI API Key prüfen
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API-Schlüssel nicht konfiguriert' })
      };
    }

    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body);
    
    const parts = parseMultipartFormData(body, boundary);
    
    if (!parts.audio) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Keine Audio-Datei gefunden' })
      };
    }

    const meetingInfo = parts.meetingInfo ? JSON.parse(parts.meetingInfo.toString()) : {};
    const audioBuffer = parts.audio;

    console.log('Audio file size:', audioBuffer.length, 'bytes');
    console.log('Meeting info:', meetingInfo);

    // Schritt 1: Audio transkribieren mit OpenAI Whisper
    console.log('Starting transcription...');
    const transcript = await transcribeAudio(audioBuffer, openaiKey);
    console.log('Transcription completed, length:', transcript.length);

    // Schritt 2: Protokoll erstellen mit GPT-4
    console.log('Generating protocol...');
    const protocol = await generateProtocol(transcript, meetingInfo, openaiKey);
    console.log('Protocol generated');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        transcript: transcript,
        protocol: protocol
      })
    };

  } catch (error) {
    console.error('Error processing meeting:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Fehler bei der Verarbeitung: ' + error.message 
      })
    };
  }
};

// Multipart Form Data parsen
function parseMultipartFormData(buffer, boundary) {
  const parts = {};
  const boundaryBuffer = Buffer.from('--' + boundary);
  
  let start = 0;
  let end = buffer.indexOf(boundaryBuffer, start);
  
  while (end !== -1) {
    const part = buffer.slice(start, end);
    
    // Parse part headers
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd !== -1) {
      const headers = part.slice(0, headerEnd).toString();
      const content = part.slice(headerEnd + 4);
      
      // Extract field name
      const nameMatch = headers.match(/name="([^"]+)"/);
      if (nameMatch) {
        const fieldName = nameMatch[1];
        
        // Check if it's a file
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          // It's a file
          parts[fieldName] = content.slice(0, -2); // Remove trailing \r\n
        } else {
          // It's a text field
          parts[fieldName] = content.slice(0, -2).toString();
        }
      }
    }
    
    start = end + boundaryBuffer.length;
    end = buffer.indexOf(boundaryBuffer, start);
  }
  
  return parts;
}

// Audio mit OpenAI Whisper transkribieren
async function transcribeAudio(audioBuffer, apiKey) {
  const formData = new FormData();
  formData.append('file', audioBuffer, {
    filename: 'meeting.webm',
    contentType: 'audio/webm'
  });
  formData.append('model', 'whisper-1');
  formData.append('language', 'de');
  formData.append('response_format', 'text');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Transkription fehlgeschlagen');
  }

  return await response.text();
}

// Protokoll mit GPT-4 erstellen
async function generateProtocol(transcript, meetingInfo, apiKey) {
  const systemPrompt = `Du bist ein professioneller Assistent für die Erstellung von Meeting-Protokollen.

Deine Aufgabe ist es, aus einem Meeting-Transkript ein strukturiertes, professionelles Protokoll zu erstellen.

Richtlinien:
1. Erstelle ein klar strukturiertes Protokoll auf Deutsch
2. Gliedere in sinnvolle Abschnitte (z.B. Teilnehmer, Themen, Beschlüsse, Aufgaben, Nächste Schritte)
3. Fasse wichtige Punkte zusammen, ohne wichtige Details zu verlieren
4. Formuliere präzise und professionell
5. Hebe Entscheidungen und Aktionspunkte hervor
6. Nutze klare Absätze, KEINE Markdown-Formatierung
7. Falls To-Dos erwähnt werden, liste diese übersichtlich auf
8. Beginne mit einem Header (Meeting-Titel, Datum, Teilnehmer)
9. Verwende nur Fließtext und einfache Textformatierung, keine Listen mit - oder *

Das Protokoll sollte sendefertig für eine E-Mail oder ein Dokument sein.`;

  const userPrompt = `Erstelle ein professionelles Meeting-Protokoll aus folgendem Transkript:

Meeting-Informationen:
Titel: ${meetingInfo.title || 'Besprechung'}
Datum: ${meetingInfo.date || new Date().toLocaleDateString('de-DE')}
Teilnehmer: ${meetingInfo.participants || 'Nicht angegeben'}

Transkript:
${transcript}

Bitte erstelle ein strukturiertes, professionelles Protokoll mit allen wichtigen Punkten, Entscheidungen und Aufgaben.`;

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
          content: userPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Protokollerstellung fehlgeschlagen');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

