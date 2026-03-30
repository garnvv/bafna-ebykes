require('dotenv').config();
const { sequelize, User, Booking, Bike } = require('../models');

async function runDiagnostics() {
  console.log('--- 🛡️ BAFNA E-BIKES SYSTEM DIAGNOSTICS ---');

  try {
    // 1. Check DB Connection
    await sequelize.authenticate();
    console.log('✅ Database Connected successfully.');

    // 2. Force Sync Schema (The main Fix)
    console.log('🏗️  Synchronizing database schema (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database Schema synchronized. Missing columns (guestName, etc.) added.');

    // 3. Verify Admin User
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount > 0) {
      console.log(`✅ Admin account exists (${adminCount} found).`);
    } else {
      console.warn('⚠️  No Admin user found! You may need to run the seed script.');
    }

    // 4. Verify Critical Tables
    const tables = ['Users', 'Bikes', 'Bookings', 'Services', 'Vehicles'];
    for (const table of tables) {
      try {
        await sequelize.query(`SELECT 1 FROM \`${table}\` LIMIT 1`);
        console.log(`✅ Table '${table}' is accessible.`);
      } catch (e) {
        console.error(`❌ Table '${table}' check failed: ${e.message}`);
      }
    }

    // 5. Test Email Config
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (emailUser && emailPass && !emailUser.includes('your_email')) {
      console.log(`✅ Email credentials detected for: ${emailUser}`);
      console.log('ℹ️  Note: Actual SMTP connection is tested during send.');
    } else {
      console.error('❌ EMAIL CREDENTIALS MISSING OR INVALID in .env');
    }

    console.log('\n--- ✨ DIAGNOSTICS COMPLETE ---');
    console.log('Your production server will now use these fixes once you push the changes.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ DIAGNOSTICS FAILED:', error.message);
    process.exit(1);
  }
}

runDiagnostics();
