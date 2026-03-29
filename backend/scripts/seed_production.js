require('dotenv').config();

process.env.DB_HOST = 'hopper.proxy.rlwy.net';
process.env.DB_PORT = '59747';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'PDMTRDHsRpKYxkDbQouMNIhCOVZdkMZz';
process.env.DB_NAME = 'railway';
process.env.DB_SSL = 'false';
process.env.NODE_ENV = 'production';

const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

sequelize.authenticate().then(async () => {
  console.log('Connected to Railway MySQL');
  await sequelize.sync();
  console.log('Tables synced');

  const hash = await bcrypt.hash('Ssb_10102021', 10);
  const [admin, created] = await User.findOrCreate({
    where: { email: 'bafnaebykes@gmail.com' },
    defaults: {
      name: 'Admin',
      email: 'bafnaebykes@gmail.com',
      password: hash,
      role: 'admin',
      phone: '7558533371',
      customerId: 'ADMIN-001'
    }
  });

  if (!created) {
    admin.password = hash;
    admin.role = 'admin';
    await admin.save();
    console.log('Admin updated successfully');
  } else {
    console.log('Admin created successfully');
  }
  console.log('Login: bafnaebykes@gmail.com / Ssb_10102021');
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
