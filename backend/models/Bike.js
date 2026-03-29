const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bike = sequelize.define('Bike', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  modelName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    defaultValue: 'bafana E-Bikes'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  battery: {
    type: DataTypes.STRING, // e.g., '48V 20Ah'
    allowNull: true
  },
  range: {
    type: DataTypes.STRING, // e.g., '80km'
    allowNull: true
  },
  topSpeed: {
    type: DataTypes.STRING, // e.g., '45km/h'
    allowNull: true
  },
  motorPower: {
    type: DataTypes.STRING, // e.g., '250W'
    allowNull: true
  },
  chargingTime: {
    type: DataTypes.STRING, // e.g., '4-5 hours'
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mainImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON, // Array of image URLs
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  threeSixtyUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING, // e.g., 'Economy', 'Premium', 'Sports'
    allowNull: true
  },
  customFeatures: {
    type: DataTypes.JSON, // Array of dynamic feature objects { name, value }
    allowNull: true
  },
  color: {
    type: DataTypes.STRING, // Comma separated or JSON array (legacy)
    allowNull: true
  },
  colorVariants: {
    type: DataTypes.JSON, // Array of { name: 'White', images: ['url1'] }
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  timestamps: true
});

module.exports = Bike;
