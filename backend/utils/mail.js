const nodemailer = require('nodemailer');

/**
 * Robust Email Mailer for Production (Gmail)
 */
const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  // 1. Validate Config
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes('your_email')) {
    console.warn('[MAIL SKIP] Email credentials not configured on Render. Skipping send.');
    return false;
  }

  try {
    // 2. Create Transporter (Optimized for Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    // 3. Define Mail Options
    const mailOptions = {
      from: `"BAFNA E-BYKES" <${user}>`,
      to,
      subject,
      text,
      html,
      attachments
    };

    // 4. Send
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL SUCCESS] Sent to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[MAIL ERROR DETAILS]');
    console.error('To:', to);
    console.error('Subject:', subject);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    return false;
  }
};

module.exports = { sendEmail };
