const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Bike = require('./Bike');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  bikeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Bike,
      key: 'id'
    }
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Bike.hasMany(Booking, { foreignKey: 'bikeId' });
Booking.belongsTo(Bike, { foreignKey: 'bikeId' });

module.exports = Booking;
