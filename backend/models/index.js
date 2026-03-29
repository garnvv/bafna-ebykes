const sequelize = require('../config/database');
const User = require('./User');
const Bike = require('./Bike');
const Booking = require('./Booking');
const Service = require('./Service');
const Feedback = require('./Feedback');
const Message = require('./Message');
const Reminder = require('./Reminder');
const Vehicle = require('./Vehicle');
const Brand = require('./Brand');
const StockItem = require('./StockItem');
const StockSale = require('./StockSale');

const models = { User, Bike, Booking, Service, Feedback, Message, Reminder, Vehicle, Brand, StockItem, StockSale };

module.exports = { sequelize, ...models };

// Associations
StockItem.hasMany(StockSale, { foreignKey: 'stockItemId' });
StockSale.belongsTo(StockItem, { foreignKey: 'stockItemId' });

User.hasMany(Vehicle, { foreignKey: 'userId' });
Vehicle.belongsTo(User, { foreignKey: 'userId' });

Bike.hasMany(Vehicle, { foreignKey: 'bikeId' });
Vehicle.belongsTo(Bike, { foreignKey: 'bikeId' });

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Bike.hasMany(Booking, { foreignKey: 'bikeId' });
Booking.belongsTo(Bike, { foreignKey: 'bikeId' });

User.hasMany(Service, { foreignKey: 'userId' });
Service.belongsTo(User, { foreignKey: 'userId' });

Vehicle.hasMany(Service, { foreignKey: 'vehicleId', sourceKey: 'vin' });
Service.belongsTo(Vehicle, { foreignKey: 'vehicleId', targetKey: 'vin' });

User.hasMany(Feedback, { foreignKey: 'userId' });
Feedback.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Reminder, { foreignKey: 'userId' });
Reminder.belongsTo(User, { foreignKey: 'userId' });
