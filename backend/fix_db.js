const { sequelize } = require('./models');

const fixDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database to fix indexes...');

    const tablesToFix = [
      { table: 'Vehicles', column: 'vin' },
      { table: 'Vehicles', column: 'vehicleRegId' },
      { table: 'Users', column: 'email' },
      { table: 'Users', column: 'customerId' }
    ];

    for (const { table, column } of tablesToFix) {
      console.log(`Checking indexes for '${column}' on '${table}' table...`);
      const [results] = await sequelize.query(`SHOW INDEX FROM ${table} WHERE Column_name = "${column}"`);
      
      if (results.length > 1) {
        console.log(`Found ${results.length} indexes. Cleaning up...`);
        
        // Key_name 'PRIMARY' should never be dropped
        // We keep the first non-primary index and drop others
        const uniqueKeys = [...new Set(results.map(r => r.Key_name))].filter(k => k !== 'PRIMARY');
        
        for (let i = 1; i < uniqueKeys.length; i++) {
          const keyName = uniqueKeys[i];
          console.log(`Dropping index: ${keyName} from ${table}`);
          try {
            await sequelize.query(`ALTER TABLE ${table} DROP INDEX ${keyName}`);
          } catch (e) {
            console.error(`Failed to drop ${keyName}:`, e.message);
          }
        }
      } else {
        console.log(`No redundant indexes for ${column}.`);
      }
    }

    console.log('\nMaintenance complete. You can now start the server.');
    console.log('IMPORTANT: Run this script with: node fix_db.js');
    process.exit(0);
  } catch (error) {
    console.error('Failed to fix database:', error);
    process.exit(1);
  }
};

fixDatabase();
