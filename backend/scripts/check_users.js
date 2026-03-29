require('dotenv').config();

process.env.DB_HOST = 'hopper.proxy.rlwy.net';
process.env.DB_PORT = '59747';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'PDMTRDHsRpKYxkDbQouMNIhCOVZdkMZz';
process.env.DB_NAME = 'railway';
process.env.DB_SSL = 'false';

const { User, sequelize } = require('../models');

sequelize.authenticate().then(async () => {
  console.log('Connected to Railway');
  const users = await User.findAll({ attributes: ['email', 'role', 'name'] });
  console.log('Users in DB:');
  users.forEach(u => console.log(`- ${u.email} (${u.role})`));
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
