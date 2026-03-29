require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

// Railway credentials
process.env.DB_HOST = 'hopper.proxy.rlwy.net';
process.env.DB_PORT = '59747';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'PDMTRDHsRpKYxkDbQouMNIhCOVZdkMZz';
process.env.DB_NAME = 'railway';
process.env.DB_SSL = 'false';

async function testLogin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Railway');
    
    const email = 'bafnaebykes@gmail.com';
    const pass = 'Ssb_10102021';
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User NOT found in DB');
      return;
    }
    
    console.log('User found. Hashed password in DB:', user.password);
    
    const isMatch = await user.comparePassword(pass);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
       // Manual check
       const manualCompare = await bcrypt.compare(pass, user.password);
       console.log('Manual bcrypt match check:', manualCompare);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testLogin();
