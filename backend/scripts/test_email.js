const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { sendEmail } = require('../utils/mail');

async function testEmail() {
  console.log('Testing email with user:', process.env.EMAIL_USER);
  const success = await sendEmail({
    to: process.env.EMAIL_USER, // Send to self for testing
    subject: '🧪 BAFNA E-BYKES Email Test',
    text: 'If you see this, your new Gmail App Password is working correctly!',
    html: '<h1>Success!</h1><p>Your new Gmail App Password is working correctly!</p>'
  });

  if (success) {
    console.log('✅ Email test passed!');
  } else {
    console.log('❌ Email test failed. Check the logs above.');
  }
}

testEmail();
