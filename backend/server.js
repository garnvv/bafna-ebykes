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

// Middleware
app.use(express.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    
    // Sync models - using standard sync to prevent 'Too many keys' crashes
    await sequelize.sync();
    
    // Rigorous explicit patch for 'userId' NULL to fix guest booking failures
    try {
      // 1. Find the Foreign Key constraint name dynamically
      const [fkResults] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'Bookings' 
          AND COLUMN_NAME = 'userId' 
          AND REFERENCED_TABLE_NAME IS NOT NULL;
      `);
      
      // 2. Drop the existing Foreign Key if it exists
      if (fkResults && fkResults.length > 0) {
        for (const row of fkResults) {
           await sequelize.query(`ALTER TABLE Bookings DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
        }
      }
      
      // 3. Modify the column to safely accept NULL values
      await sequelize.query("ALTER TABLE Bookings MODIFY `userId` int NULL");
      
      // 4. Re-add the constrained Foreign Key relationship
      await sequelize.query(`
        ALTER TABLE Bookings 
        ADD CONSTRAINT fk_bookings_userId_patch 
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      
      console.log('[DB] ✅ Explicit Patch Applied: Bookings.userId is now formally NULLABLE');
    } catch (err) {
      if (err.message.includes('Duplicate check constraint') || err.message.includes('already exists')) {
        console.log('[DB] Patch ignored: userId is already patched correctly.');
      } else {
        console.warn('[DB] Patch Skipped/Failed (Could be harmless if already Nullable). Error:', err.message);
      }
    }
    
    console.log('[DB] Database models fully initialized');

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
