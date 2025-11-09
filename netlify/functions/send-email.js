const nodemailer = require('nodemailer');

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

    // E-Mail-Konfiguration aus Umgebungsvariablen
    const emailConfig = {
      user: process.env.EMAIL_USER || 'laola@baederbook.de',
      password: process.env.EMAIL_PASSWORD,
      host: process.env.SMTP_HOST || 'smtp.united-domains.de',
      port: parseInt(process.env.SMTP_PORT || '587')
    };

    if (!emailConfig.password) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'E-Mail-Konfiguration nicht vollständig. Bitte Umgebungsvariablen überprüfen.' 
        })
      };
    }

    // Nodemailer Transporter erstellen
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465, // true für Port 465, false für andere Ports
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password
      },
      tls: {
        rejectUnauthorized: false // Für self-signed certificates
      }
    });

    // E-Mail senden
    const info = await transporter.sendMail({
      from: `"E-Mail Assistent" <${emailConfig.user}>`,
      to: to,
      subject: subject || 'Nachricht von E-Mail Assistent',
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    console.log('E-Mail gesendet:', info.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        message: `E-Mail erfolgreich an ${to} gesendet`
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

