const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockSale = sequelize.define('StockSale', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  billNo: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. BILL-20260320-001
  stockItemId: { type: DataTypes.INTEGER, allowNull: false },
  quantitySold: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },   // price at time of sale
  dealerPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },  // cost at time of sale
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },  // qty * unitPrice
  profit: { type: DataTypes.DECIMAL(10, 2), allowNull: false },       // totalAmount - (qty * dealerPrice)
  // Customer info
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerEmail: { type: DataTypes.STRING, allowNull: true },
  customerWhatsapp: { type: DataTypes.STRING, allowNull: true },
  customerAddress: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = StockSale;
