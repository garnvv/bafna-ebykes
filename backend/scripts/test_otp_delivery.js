require('dotenv').config();
const { sendEmail } = require('../utils/notify'); // Unified email engine

async function testOtpDelivery() {
  const email = 'gauravnpatil2005@gmail.com'; // Try delivering to user's real email
  console.log(`Testing OTP Email Delivery to ${email}...`);
  
  const text = 'Your OTP is 123456';
  const html = '<h1>123456</h1>';
  
  try {
    const success = await sendEmail({
      to: email,
      subject: 'OTP Delivery Test',
      text,
      html
    });
    
    if (success) {
      console.log('SUCCESS! Google SMTP accepted and delivered the email.');
    } else {
      console.log('FAILED! Network or Credential configuration rejected it.');
    }
  } catch (err) {
    console.error('CRASH:', err.message);
  }
}

testOtpDelivery();
