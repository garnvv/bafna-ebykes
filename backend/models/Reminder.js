const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Reminder = sequelize.define('Reminder', {
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
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remindAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending'
  },
  type: {
    type: DataTypes.STRING, // e.g., 'service-reminder', 'test-ride-reminder'
    allowNull: true
  }
}, {
  timestamps: true
});

User.hasMany(Reminder, { foreignKey: 'userId' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

module.exports = Reminder;
