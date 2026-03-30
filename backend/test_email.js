require('dotenv').config();
const nodemailer = require('nodemailer');

const sendTestEmail = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log('Using credentials:', { user, pass: pass ? '******' : 'MISSING' });

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass
    }
  });

  const mailOptions = {
    from: `"BAFNA E-BYKES TEST" <${user}>`,
    to: user, // Send to self
    subject: 'Test Email from BAFNA System',
    text: 'If you see this, the email service is working correctly.',
    html: '<b>If you see this, the email service is working correctly.</b>'
  };

  try {
    console.log('Attempting to send test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendTestEmail();
