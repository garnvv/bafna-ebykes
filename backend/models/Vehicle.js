const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // Unique auto-generated vehicle registration ID shown to user
  vehicleRegId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  vin: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bikeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  lastServiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  nextServiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  serviceIntervalDays: {
    type: DataTypes.INTEGER,
    defaultValue: 90  // 3 months default
  },
  mileage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'in-service', 'sold', 'archived'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Vehicle;
