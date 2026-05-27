const { Sequelize } = require('sequelize');
require('dotenv').config();

const sslOptions = process.env.DB_SSL === 'true' ? {
  ssl: {
    require: true,
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  }
} : {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 60000,
      idle: 20000,
      evict: 30000
    },
    dialectOptions: {
      ...sslOptions,
      connectTimeout: 60000,
      timezone: '+05:30'
    },
    retry: {
      max: 5,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ENOTFOUND/,
        /SequelizeConnectionError/
      ]
    }
  }
);

module.exports = sequelize;
