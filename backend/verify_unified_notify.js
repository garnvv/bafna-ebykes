require('dotenv').config();
const { sendEmail, sendNotificationEmail } = require('./utils/notify');

const runVerification = async () => {
  const user = process.env.EMAIL_USER;
  console.log('Testing unified notify.js with:', user);

  try {
    console.log('1. Testing sendEmail...');
    const res1 = await sendEmail({
      to: user,
      subject: 'Unified Email Test - Step 1',
      text: 'This is a test of the unified sendEmail function.',
      html: '<b>This is a test of the unified sendEmail function.</b>'
    });
    console.log('sendEmail result:', res1 ? 'SUCCESS' : 'FAILED');

    console.log('\n2. Testing sendNotificationEmail...');
    const res2 = await sendNotificationEmail({
      to: user,
      subject: 'Unified Notification Test - Step 2',
      message: 'This is a test of the unified notification function.'
    });
    console.log('sendNotificationEmail result:', res2 ? 'SUCCESS' : 'FAILED');

    if (res1 && res2) {
      console.log('\n✅ Verification PASSED: All email functions are working correctly!');
    } else {
      console.log('\n❌ Verification FAILED: Some functions did not return success.');
    }
  } catch (error) {
    console.error('\n❌ Verification ERROR:', error.message);
  }
};

runVerification();
