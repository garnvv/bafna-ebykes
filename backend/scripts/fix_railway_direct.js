require('dotenv').config();
const { Sequelize } = require('sequelize');

// Override with Railway credentials for target DB
const TARGET = {
  DB_HOST: 'hopper.proxy.rlwy.net',
  DB_PORT: '59747',
  DB_USER: 'root',
  DB_PASSWORD: 'PDMTRDHsRpKYxkDbQouMNIhCOVZdkMZz',
  DB_NAME: 'railway',
  DB_SSL: 'false'
};

const targetDb = new Sequelize(
  TARGET.DB_NAME,
  TARGET.DB_USER,
  TARGET.DB_PASSWORD,
  { host: TARGET.DB_HOST, port: parseInt(TARGET.DB_PORT), dialect: 'mysql', logging: false }
);

async function fixRailwayDB() {
  try {
    await targetDb.authenticate();
    console.log('Connected to Railway Production DB...');

    // 1. Find FKs
    const [fkResults] = await targetDb.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Bookings' 
        AND COLUMN_NAME = 'userId' 
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);

    // 2. Drop them
    if (fkResults && fkResults.length > 0) {
      for (const row of fkResults) {
         console.log('Dropping FK:', row.CONSTRAINT_NAME);
         await targetDb.query(`ALTER TABLE Bookings DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
      }
    }

    // 3. Alter Column
    console.log('Altering Bookings.userId to NULLABLE...');
    await targetDb.query("ALTER TABLE Bookings MODIFY `userId` int NULL");

    // 4. Re-add
    console.log('Re-adding FK...');
    await targetDb.query(`
      ALTER TABLE Bookings 
      ADD CONSTRAINT fk_bookings_userId_patch 
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // We can also verify
    const [desc] = await targetDb.query("DESCRIBE Bookings `userId`");
    console.log('Current state of userId:', desc[0].Null === 'YES' ? 'NULLABLE ✅' : 'NOT NULL ❌');

    console.log('Patch successfully applied to Railway Production DB.');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('already exists')) {
       console.log('Already patched. Checking state...');
       const [desc] = await targetDb.query("DESCRIBE Bookings `userId`");
       console.log('Current state of userId:', desc[0].Null === 'YES' ? 'NULLABLE ✅' : 'NOT NULL ❌');
    } else {
       console.error('Failed to patch Railway DB:', err);
    }
  }
}

fixRailwayDB();
