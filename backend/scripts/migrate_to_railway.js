require('dotenv').config();

// Override with Railway credentials for target DB
const TARGET = {
  DB_HOST: 'hopper.proxy.rlwy.net',
  DB_PORT: '59747',
  DB_USER: 'root',
  DB_PASSWORD: 'PDMTRDHsRpKYxkDbQouMNIhCOVZdkMZz',
  DB_NAME: 'railway',
  DB_SSL: 'false'
};

const { Sequelize } = require('sequelize');

// Source = local MySQL
const sourceDb = new Sequelize(
  process.env.DB_NAME || 'bafana_ebikes',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD,
  { host: 'localhost', dialect: 'mysql', logging: false }
);

// Target = Railway MySQL
const targetDb = new Sequelize(
  TARGET.DB_NAME,
  TARGET.DB_USER,
  TARGET.DB_PASSWORD,
  { host: TARGET.DB_HOST, port: parseInt(TARGET.DB_PORT), dialect: 'mysql', logging: false }
);

const TABLES = ['Brands', 'Bikes', 'Users', 'Vehicles', 'Bookings', 'Services', 'Feedbacks', 'Messages', 'Reminders', 'StockItems', 'StockSales'];

async function migrate() {
  try {
    await sourceDb.authenticate();
    console.log('Source (local) connected');
    await targetDb.authenticate();
    console.log('Target (Railway) connected');

    for (const table of TABLES) {
      try {
        const [rows] = await sourceDb.query(`SELECT * FROM \`${table}\``);
        if (rows.length === 0) { console.log(`${table}: empty, skipping`); continue; }

        // Delete existing rows in target to avoid duplicates
        await targetDb.query(`SET FOREIGN_KEY_CHECKS=0`);
        await targetDb.query(`DELETE FROM \`${table}\``);

        // Insert rows
        for (const row of rows) {
          const cols = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const vals = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(v).replace(/'/g, "''")}'`;
          }).join(', ');
          await targetDb.query(`INSERT INTO \`${table}\` (${cols}) VALUES (${vals})`);
        }
        await targetDb.query(`SET FOREIGN_KEY_CHECKS=1`);
        console.log(`${table}: migrated ${rows.length} rows ✅`);
      } catch (err) {
        console.log(`${table}: skipped (${err.message.slice(0, 60)})`);
      }
    }
    console.log('\nMigration complete! ✅');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
