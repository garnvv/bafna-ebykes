require('dotenv').config();

const { Sequelize } = require('sequelize');

const sourceDb = new Sequelize(
  process.env.DB_NAME || 'bafana_ebikes',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD,
  { host: 'localhost', dialect: 'mysql', logging: false }
);

const targetDb = new Sequelize(
  'railway', 'root', 'PDMTRDHsRpKYxkDbQouMNIhCOVZdkMZz',
  { host: 'hopper.proxy.rlwy.net', port: 59747, dialect: 'mysql', logging: false }
);

function escapeValue(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (typeof v === 'number') return v;
  if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function migrateBikes() {
  try {
    await sourceDb.authenticate();
    await targetDb.authenticate();
    console.log('Both DBs connected');

    const [rows] = await sourceDb.query('SELECT * FROM `Bikes`');
    console.log(`Found ${rows.length} bikes in local DB`);

    await targetDb.query('SET FOREIGN_KEY_CHECKS=0');
    await targetDb.query('DELETE FROM `Bikes`');

    for (const row of rows) {
      const cols = Object.keys(row).map(k => `\`${k}\``).join(', ');
      const vals = Object.values(row).map(escapeValue).join(', ');
      try {
        await targetDb.query(`INSERT INTO \`Bikes\` (${cols}) VALUES (${vals})`);
        console.log(`Bike ${row.id} (${row.modelName}) migrated ✅`);
      } catch (err) {
        console.log(`Bike ${row.id} failed: ${err.message.slice(0, 80)}`);
      }
    }

    await targetDb.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('\nBike migration complete! ✅');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

migrateBikes();
