const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Service = sequelize.define('Service', {
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
  vehicleId: {
    type: DataTypes.STRING, // VIN
    allowNull: true
  },
  serviceType: {
    type: DataTypes.ENUM('normal', 'repair', 'battery'),
    allowNull: false
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});

User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });

module.exports = Service;
