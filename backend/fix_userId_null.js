const { sequelize } = require('./models');

async function fixUserId() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');
    
    // Find foreign key for userId on Bookings table
    const [results] = await sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Bookings' 
        AND COLUMN_NAME = 'userId' 
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    
    if (results.length > 0) {
      for (const row of results) {
         console.log('Dropping FK:', row.CONSTRAINT_NAME);
         await sequelize.query(`ALTER TABLE Bookings DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
      }
    }
    
    console.log('Altering userId column to allow nulls...');
    await sequelize.query(`ALTER TABLE Bookings MODIFY userId INT NULL`);
    
    console.log('Re-adding foreign key...');
    await sequelize.query(`
      ALTER TABLE Bookings 
      ADD CONSTRAINT fk_bookings_userId 
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);

    console.log('Success!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
fixUserId();
