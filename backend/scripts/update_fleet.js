const { sequelize, Brand, Bike } = require('../models');

async function updateFleet() {
  try {
    console.log('Synchronizing database models...');
    await sequelize.authenticate();
    
    // Clear existing bikes and brands
    console.log('Clearing old bikes and brands...');
    await Bike.destroy({ where: {} });
    console.log('Bikes cleared.');
    
    await Brand.destroy({ where: {} });
    console.log('Brands cleared.');

    // Create USTROME brand
    console.log('Creating USTROME brand...');
    const ustrome = await Brand.create({
      name: 'USTROME',
      logoUrl: '/uploads/ustrome-logo.png',
      description: 'US Energy Technical Specification'
    });

    // Create Liberty+
    console.log('Creating Liberty+ bike...');
    await Bike.create({
      modelName: 'Liberty+',
      brand: ustrome.name,
      category: 'No RTO / No Licence',
      price: 0,
      battery: 'TBD',
      range: 'TBD',
      topSpeed: 'TBD',
      motorPower: 'TBD',
      chargingTime: 'TBD',
      color: JSON.stringify(['Black', 'White']),
      images: [
        '/uploads/liberty_1.png',
        '/uploads/liberty_2.png',
        '/uploads/liberty_3.png',
        '/uploads/us_energy_features.png'
      ],
      isFeatured: true
    });

    // Create Affair Lite
    console.log('Creating Affair Lite bike...');
    await Bike.create({
      modelName: 'Affair Lite',
      brand: ustrome.name,
      category: 'No RTO / No Licence',
      price: 0,
      battery: 'TBD',
      range: 'TBD',
      topSpeed: 'TBD',
      motorPower: 'TBD',
      chargingTime: 'TBD',
      color: JSON.stringify(['Grey']),
      images: [
        '/uploads/affair_1.png',
        '/uploads/affair_2.png',
        '/uploads/affair_3.png',
        '/uploads/us_energy_features.png'
      ],
      isFeatured: true
    });

    console.log('Fleet updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating fleet:', error);
    process.exit(1);
  }
}

updateFleet();
