/**
 * Notification Service
 * Handles mock WhatsApp and real Email notifications
 */
const nodemailer = require('nodemailer');

// Mock WhatsApp Sender
const sendWhatsApp = async (phone, message) => {
  console.log(`[WHATSAPP MOCK] Sending to ${phone}: ${message}`);
  // In a real scenario, you'd use Twilio or a similar API here:
  // const client = require('twilio')(sid, auth);
  // await client.messages.create({ body: message, from: 'whatsapp:+14155238886', to: `whatsapp:${phone}` });
  return true;
};

// Email Sender
const sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    // Note: You'll need to configure transport with real credentials in .env
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Bafna E-Bykes" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR]', error.message);
    return false;
  }
};

module.exports = {
  sendWhatsApp,
  sendEmail
};
