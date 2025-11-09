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
    const { to, subject, message } = JSON.parse(event.body);

    if (!to || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Empfänger und Nachricht sind erforderlich' 
        })
      };
    }

    // Versuche zuerst SendGrid
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.EMAIL_USER || 'laola@baederbook.de';

    if (sendgridKey) {
      return await sendViaSendGrid(to, subject, message, fromEmail, sendgridKey, headers);
    }

    // Fallback: Mailgun
    const mailgunKey = process.env.MAILGUN_API_KEY;
    const mailgunDomain = process.env.MAILGUN_DOMAIN;

    if (mailgunKey && mailgunDomain) {
      return await sendViaMailgun(to, subject, message, fromEmail, mailgunKey, mailgunDomain, headers);
    }

    // Fallback: SMTP2GO
    const smtp2goKey = process.env.SMTP2GO_API_KEY;

    if (smtp2goKey) {
      return await sendViaSMTP2GO(to, subject, message, fromEmail, smtp2goKey, headers);
    }

    // Keine E-Mail-Service-API konfiguriert
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Kein E-Mail-Service konfiguriert. Bitte setzen Sie SENDGRID_API_KEY, MAILGUN_API_KEY oder SMTP2GO_API_KEY als Umgebungsvariable.',
        help: 'Siehe SETUP.md für Anweisungen zur Konfiguration eines E-Mail-Services.'
      })
    };

  } catch (error) {
    console.error('Fehler beim E-Mail-Versand:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Fehler beim E-Mail-Versand: ' + error.message 
      })
    };
  }
};

// SendGrid verwenden
async function sendViaSendGrid(to, subject, message, from, apiKey, headers) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: { email: from, name: 'E-Mail Assistent' },
      subject: subject || 'Nachricht von E-Mail Assistent',
      content: [{
        type: 'text/plain',
        value: message
      }, {
        type: 'text/html',
        value: message.replace(/\n/g, '<br>')
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid Fehler: ${error}`);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      provider: 'SendGrid',
      message: `E-Mail erfolgreich an ${to} gesendet`
    })
  };
}

// Mailgun verwenden
async function sendViaMailgun(to, subject, message, from, apiKey, domain, headers) {
  const auth = Buffer.from(`api:${apiKey}`).toString('base64');
  
  const formData = new URLSearchParams();
  formData.append('from', `E-Mail Assistent <${from}>`);
  formData.append('to', to);
  formData.append('subject', subject || 'Nachricht von E-Mail Assistent');
  formData.append('text', message);
  formData.append('html', message.replace(/\n/g, '<br>'));

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mailgun Fehler: ${error}`);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      provider: 'Mailgun',
      message: `E-Mail erfolgreich an ${to} gesendet`
    })
  };
}

// SMTP2GO verwenden
async function sendViaSMTP2GO(to, subject, message, from, apiKey, headers) {
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: apiKey,
      to: [to],
      sender: from,
      subject: subject || 'Nachricht von E-Mail Assistent',
      text_body: message,
      html_body: message.replace(/\n/g, '<br>')
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SMTP2GO Fehler: ${error}`);
  }

  const data = await response.json();
  
  if (data.data.error_code) {
    throw new Error(`SMTP2GO Fehler: ${data.data.error}`);
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      provider: 'SMTP2GO',
      message: `E-Mail erfolgreich an ${to} gesendet`
    })
  };
}

