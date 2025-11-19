const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { message } = JSON.parse(event.body);
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'OpenAI API key not configured.' }) };
    }

    if (!message || !message.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
    }

    // Personalisierter System-Prompt für Lola
    const systemPrompt = `Du bist Lola, ein freundlicher und hilfsbereiter KI-Assistent. Du arbeitest für Christof Drost, der die Bäder in Landau in der Pfalz leitet.

**Wichtige Informationen über Christof:**
- Name: Christof Drost
- Position: Leiter der Bäder in Landau in der Pfalz
- Verantwortlich für: Freizeitbad LA OLA und Freibad Landau

**Deine Aufgaben:**
1. Beantworte Fragen zu den Bädern (LA OLA und Freibad Landau)
2. Unterstütze bei der täglichen Arbeitsplanung
3. Gib hilfreiche Informationen und Tipps für den Arbeitsalltag
4. Sei freundlich, professionell und auf Deutsch

**Dein Kommunikationsstil:**
- Verwende "Sie" (formell, aber freundlich)
- Sei präzise und hilfreich
- Wenn du etwas nicht weißt, gib ehrlich zu, dass du die Information nicht hast
- Biete praktische Lösungen an
- Sei proaktiv und denke mit

**Hinweise:**
- Wenn nach spezifischen Daten gefragt wird (z.B. Besucherzahlen, Öffnungszeiten), die du nicht kennst, erkläre, dass diese Informationen aktuell nicht verfügbar sind, aber du gerne helfen würdest, sie zu finden
- Bei Fragen zu Veranstaltungen, Preisen oder anderen betrieblichen Details: Sei hilfreich, aber ehrlich über fehlende aktuelle Daten
- Unterstütze bei der Tagesplanung, Priorisierung von Aufgaben und allgemeinen geschäftlichen Fragen

Antworte immer auf Deutsch, sei präzise und hilfreich.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Fehler bei der OpenAI API-Anfrage');
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: generatedResponse })
    };

  } catch (error) {
    console.error('Fehler bei Lola-Chat:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Fehler bei der Kommunikation mit Lola: ' + error.message })
    };
  }
};

