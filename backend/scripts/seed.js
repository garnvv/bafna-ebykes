const { sequelize, User, Bike } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    // force: true drops and recreates all tables — removes all previous data
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared and synced.');

    // ── YAKUZA BIKES ──────────────────────────────────────────────
    await Bike.bulkCreate([
      {
        brand: 'Yakuza',
        modelName: 'Yakuza Ronin X',
        category: 'High Performance',
        price: 148999,
        battery: '72V 40Ah',
        range: '140km',
        topSpeed: '80km/h',
        motorPower: '2000W BLDC Hub',
        chargingTime: '5-6 Hours',
        color: 'Matte Black, Blood Red, Gunmetal Grey',
        description: 'The Yakuza Ronin X is a beast on the road. Engineered for performance riders who demand power and style in equal measure.',
        mainImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
        stock: 8
      },
      {
        brand: 'Yakuza',
        modelName: 'Yakuza Phantom Neo',
        category: 'Urban Street',
        price: 99999,
        battery: '60V 30Ah',
        range: '110km',
        topSpeed: '65km/h',
        motorPower: '1500W Mid-Drive',
        chargingTime: '4-5 Hours',
        color: 'Pearl White, Stealth Black, Midnight Blue',
        description: 'Urban dominance, redefined. The Phantom Neo blends stunning aesthetics with next-gen electric performance.',
        mainImage: 'https://images.unsplash.com/photo-1571068316344-75bc76f7789e?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1571068316344-75bc76f7789e?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
        stock: 12
      },
      {
        brand: 'Yakuza',
        modelName: 'Yakuza Storm Lite',
        category: 'Economy',
        price: 69999,
        battery: '48V 24Ah',
        range: '85km',
        topSpeed: '50km/h',
        motorPower: '750W Hub Motor',
        chargingTime: '3-4 Hours',
        color: 'Ocean Blue, Olive Green, Crimson Red',
        description: 'Built for daily commuters who want reliability without the premium price tag.',
        mainImage: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800'],
        isFeatured: false,
        stock: 20
      }
    ]);
    console.log('✅ Yakuza bikes seeded.');

    // ── OLA ELECTRIC BIKES ─────────────────────────────────────────
    await Bike.bulkCreate([
      {
        brand: 'Ola Electric',
        modelName: 'Ola S1 Pro',
        category: 'Flagship',
        price: 134999,
        battery: '3.97 kWh Li-ion',
        range: '181km',
        topSpeed: '116km/h',
        motorPower: '8.5kW Peak',
        chargingTime: '6.5 Hours (Standard)',
        color: 'Jet Black, Snow White, Coral Glam, Neo Mint',
        description: 'The most advanced electric scooter ever made by Ola. MoveOS 4, 7" touchscreen, and over-the-air updates.',
        mainImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
        stock: 15
      },
      {
        brand: 'Ola Electric',
        modelName: 'Ola S1 Air',
        category: 'Mid-Range',
        price: 84999,
        battery: '2.5 kWh Li-ion',
        range: '151km',
        topSpeed: '90km/h',
        motorPower: '6kW Peak',
        chargingTime: '5 Hours',
        color: 'Porcelain White, Midnight Black, Liquid Silver',
        description: 'More range, same charm. The Ola S1 Air makes electric mobility accessible to everyone.',
        mainImage: 'https://images.unsplash.com/photo-1558981359-0a43c2f8cef0?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1558981359-0a43c2f8cef0?auto=format&fit=crop&q=80&w=800'],
        isFeatured: false,
        stock: 25
      }
    ]);
    console.log('✅ Ola Electric bikes seeded.');

    // ── ATHER BIKES ────────────────────────────────────────────────
    await Bike.bulkCreate([
      {
        brand: 'Ather',
        modelName: 'Ather 450X Gen 3',
        category: 'Smart Performance',
        price: 155999,
        battery: '3.7 kWh',
        range: '146km',
        topSpeed: '90km/h',
        motorPower: '6.4kW',
        chargingTime: '5.5 Hours',
        color: 'Space Grey, Salt White, Cosmic Black',
        description: 'Smarter. Faster. Better. The Ather 450X Gen 3 features Atom SoC, WhizzAR navigation, and intelligent ride modes.',
        mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
        stock: 10
      }
    ]);
    console.log('✅ Ather bikes seeded.');

    // ── ADMIN USER ─────────────────────────────────────────────────
    await User.create({
      customerId: 'BAF-ADMIN-001',
      name: 'bafana Admin',
      email: 'admin@bafana.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 00000'
    });
    console.log('✅ Admin seeded → admin@bafana.com / admin123');

    console.log('\n🎉 All seed data loaded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
