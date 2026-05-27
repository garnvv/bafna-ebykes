const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
require('./utils/reminders'); // Initialize Reminders Cron

// Route files
const authRoutes = require('./routes/authRoutes');
const bikeRoutes = require('./routes/bikeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();

// Track DB readiness
let dbReady = false;

// Middleware
app.use(express.json());
app.use(morgan('combined'));

// CORS — allow all origins so frontend on Render/Vercel can reach backend
app.use(cors({
  origin: '*',
  credentials: false,
  optionsSuccessStatus: 200
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// ── Health Check (MUST come before all routes) ──────────────────
// Render needs this to confirm the service is alive.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: dbReady ? 'connected' : 'connecting' });
});
app.get('/', (req, res) => {
  res.json({ message: 'Bafana E-Bikes API is running', version: '2.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stock', stockRoutes);

// Static files (for images/videos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;

const applyDbPatches = async () => {
  try {
    const [fkResults] = await sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Bookings' 
        AND COLUMN_NAME = 'userId' 
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    if (fkResults && fkResults.length > 0) {
      for (const row of fkResults) {
        await sequelize.query(`ALTER TABLE Bookings DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
      }
    }
    await sequelize.query("ALTER TABLE Bookings MODIFY `userId` int NULL");
    await sequelize.query(`
      ALTER TABLE Bookings 
      ADD CONSTRAINT fk_bookings_userId_patch 
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log('[DB] ✅ Patch: Bookings.userId is NULLABLE');
  } catch (err) {
    if (err.message.includes('Duplicate') || err.message.includes('already exists')) {
      console.log('[DB] Patch already applied.');
    } else {
      console.warn('[DB] Patch skipped:', err.message);
    }
  }
};

const startServer = async () => {
  // START HTTP SERVER FIRST — so Render health checks pass immediately
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT} — connecting to database...`);
  });

  // Then connect to DB with retry
  let attempts = 0;
  const MAX_ATTEMPTS = 10;
  while (attempts < MAX_ATTEMPTS) {
    try {
      attempts++;
      console.log(`[DB] Connection attempt ${attempts}/${MAX_ATTEMPTS}...`);
      await sequelize.authenticate();
      console.log('[DB] ✅ Database connected successfully.');

      await sequelize.sync({ alter: false });
      console.log('[DB] ✅ Models synced.');

      await applyDbPatches();

      dbReady = true;
      console.log('[DB] ✅ Database fully initialized. System is ready!');
      break;
    } catch (error) {
      console.error(`[DB] ❌ Connection attempt ${attempts} failed:`, error.message);
      if (attempts >= MAX_ATTEMPTS) {
        console.error('[DB] 💀 Max retries exceeded. Server running but DB unavailable.');
      } else {
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
        console.log(`[DB] Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
};

startServer();
