/**
 * seed_cloud.js
 * Run with: DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... DB_SSL=true node scripts/seed_cloud.js
 * OR edit the TARGET object below directly.
 */
require('dotenv').config();

// ── EDIT THESE or pass as environment variables ──────────────────────────────
const TARGET = {
  DB_HOST:     process.env.DB_HOST     || 'YOUR_HOST',
  DB_PORT:     process.env.DB_PORT     || '3306',
  DB_USER:     process.env.DB_USER     || 'YOUR_USER',
  DB_PASSWORD: process.env.DB_PASSWORD || 'YOUR_PASSWORD',
  DB_NAME:     process.env.DB_NAME     || 'YOUR_DB_NAME',
  DB_SSL:      process.env.DB_SSL      || 'true',
};
// ─────────────────────────────────────────────────────────────────────────────

// Inject to process.env so models pick them up
Object.entries(TARGET).forEach(([k, v]) => { process.env[k] = v; });

const { sequelize, User, Bike } = require('../models');

async function seed() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected!');

    console.log('🔄 Syncing tables (force: true = fresh start)...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables created fresh.');

    // ── ADMIN USER ────────────────────────────────────────────────────────────
    // NOTE: Do NOT pre-hash passwords. The User model's beforeCreate hook handles hashing.
    await User.create({
      customerId:  'BAF-ADMIN-001',
      name:        'Bafana Admin',
      email:       'admin@bafana.com',
      password:    'admin123',
      role:        'admin',
      phone:       '7558533371'
    });
    console.log('✅ Admin created → admin@bafana.com / admin123');

    // ── SAMPLE USER ───────────────────────────────────────────────────────────
    await User.create({
      customerId:  'BAF-USER-001',
      name:        'John Doe',
      email:       'john@example.com',
      password:    'password123',
      role:        'user',
      phone:       '9876543210'
    });
    console.log('✅ Sample user created → john@example.com / password123');

    // ── BIKES ──────────────────────────────────────────────────────────────────
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
        description: 'The Yakuza Ronin X is engineered for performance riders who demand power and style in equal measure.',
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
      },
      {
        brand: 'Ola Electric',
        modelName: 'Ola S1 Pro',
        category: 'Flagship',
        price: 134999,
        battery: '3.97 kWh Li-ion',
        range: '181km',
        topSpeed: '116km/h',
        motorPower: '8.5kW Peak',
        chargingTime: '6.5 Hours',
        color: 'Jet Black, Snow White, Coral Glam, Neo Mint',
        description: 'The most advanced electric scooter. MoveOS 4, 7" touchscreen, and over-the-air updates.',
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
      },
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
        description: 'Smarter. Faster. Better. Ather 450X Gen 3 features Atom SoC and intelligent ride modes.',
        mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
        stock: 10
      },
      {
        brand: 'Bajaj',
        modelName: 'Chetak Electric',
        category: 'Classic Electric',
        price: 109999,
        battery: '3.0 kWh',
        range: '113km',
        topSpeed: '73km/h',
        motorPower: '4.1kW',
        chargingTime: '5 Hours',
        color: 'Hazel Brown, Indigo Blue, Matte White',
        description: 'A legend reborn. The Bajaj Chetak Electric combines iconic retro styling with modern EV technology.',
        mainImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
        images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800'],
        isFeatured: true,
        stock: 18
      }
    ]);
    console.log('✅ 7 bikes seeded successfully.');

    console.log('\n🎉 Database seeded! Login credentials:');
    console.log('   Admin: admin@bafana.com / admin123');
    console.log('   User:  john@example.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
