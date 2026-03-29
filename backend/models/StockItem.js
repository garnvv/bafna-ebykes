const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockItem = sequelize.define('StockItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },           // e.g. "Brake Pad Set"
  sku: { type: DataTypes.STRING, allowNull: true, unique: true }, // Stock keeping unit
  category: { type: DataTypes.STRING, allowNull: true },        // e.g. Brakes, Tyres, Accessories
  description: { type: DataTypes.TEXT, allowNull: true },
  dealerPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, // cost from supplier
  sellingPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, // price to customer
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },       // current stock
  unit: { type: DataTypes.STRING, defaultValue: 'pcs' },        // pcs, kg, set, etc.
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  lowStockAlert: { type: DataTypes.INTEGER, defaultValue: 5 },  // alert when qty <= this
}, { timestamps: true });

module.exports = StockItem;
