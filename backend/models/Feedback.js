const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Bike = require('./Bike');

const Feedback = sequelize.define('Feedback', {
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
    allowNull: true,
    references: {
      model: Bike,
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('bike', 'service', 'showroom'),
    allowNull: false
  }
}, {
  timestamps: true
});

User.hasMany(Feedback, { foreignKey: 'userId' });
Feedback.belongsTo(User, { foreignKey: 'userId' });

Bike.hasMany(Feedback, { foreignKey: 'bikeId' });
Feedback.belongsTo(Bike, { foreignKey: 'bikeId' });

module.exports = Feedback;
