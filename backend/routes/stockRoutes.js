const express = require('express');
const router = express.Router();
const { StockItem, StockSale, sequelize } = require('../models');
const { protect, admin } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

// ── STOCK ITEMS ───────────────────────────────────────────────────────────────

// GET all stock items
router.get('/', protect, admin, async (req, res) => {
  try {
    const items = await StockItem.findAll({ order: [['name', 'ASC']] });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create stock item
router.post('/', protect, admin, async (req, res) => {
  try {
    const item = await StockItem.create(req.body);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// GET search stock items
router.get('/search', protect, admin, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const items = await StockItem.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { sku: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: 10
    });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT update stock item (including restocking)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await item.update(req.body);
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// POST add more stock (restock)
router.post('/:id/restock', protect, admin, async (req, res) => {
  try {
    const { qty } = req.body;
    const item = await StockItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.quantity = item.quantity + Number(qty);
    await item.save();
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE stock item
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await item.destroy();
    res.json({ message: 'Stock item deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── STOCK SALES ───────────────────────────────────────────────────────────────

// GET all sales (with item info)
router.get('/sales', protect, admin, async (req, res) => {
  try {
    const sales = await StockSale.findAll({
      include: [{ model: StockItem, attributes: ['name', 'sku', 'unit', 'category'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(sales);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET sales for a single stock item
router.get('/:id/sales', protect, admin, async (req, res) => {
  try {
    const sales = await StockSale.findAll({
      where: { stockItemId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(sales);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST sell stock — deduct qty, create bill, record sale
router.post('/sell', protect, admin, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      stockItemId, quantitySold,
      customerName, customerEmail, customerWhatsapp, customerAddress, notes
    } = req.body;

    const item = await StockItem.findByPk(stockItemId, { transaction: t });
    if (!item) { await t.rollback(); return res.status(404).json({ message: 'Stock item not found' }); }
    if (item.quantity < Number(quantitySold)) {
      await t.rollback();
      return res.status(400).json({ message: `Only ${item.quantity} ${item.unit} available in stock` });
    }

    // Deduct from stock
    item.quantity = item.quantity - Number(quantitySold);
    await item.save({ transaction: t });

    // Generate bill number: BILL-YYYYMMDD-<random 4>
    const dateStr = new Date().toISOString().substring(0, 10).replace(/-/g, '');
    const billNo = `BILL-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const unitPrice = Number(item.sellingPrice);
    const dealerPrice = Number(item.dealerPrice);
    const qty = Number(quantitySold);
    const totalAmount = unitPrice * qty;
    const profit = totalAmount - (dealerPrice * qty);

    const sale = await StockSale.create({
      billNo, stockItemId, quantitySold: qty,
      unitPrice, dealerPrice, totalAmount, profit,
      customerName, customerEmail, customerWhatsapp, customerAddress, notes
    }, { transaction: t });

    await t.commit();

    // Reload with association for response
    const saleWithItem = await StockSale.findByPk(sale.id, {
      include: [{ model: StockItem }]
    });
    res.status(201).json({ sale: saleWithItem, updatedItem: item });
  } catch (e) {
    await t.rollback();
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
