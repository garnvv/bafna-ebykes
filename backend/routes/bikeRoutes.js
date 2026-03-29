const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getBikes, getBikeById, createBike, updateBike, deleteBike } = require('../controllers/bikeController');
const { protect, admin } = require('../middleware/authMiddleware');
const { Brand } = require('../models');

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Unique filename: fieldname-timestamp-originalname
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// ── Brand Routes ─────────────────────────────────────────────────────────────
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.findAll({ order: [['name', 'ASC']] });
    res.json(brands);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/brands', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Brand name required' });
    const [brand, created] = await Brand.findOrCreate({ where: { name: name.trim() } });
    res.status(created ? 201 : 200).json(brand);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/brands/:id', protect, admin, async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    await brand.destroy();
    res.json({ message: 'Brand deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Bike Routes ──────────────────────────────────────────────────────────────
// Use upload.any() to support dynamically named multiple files for color variants
router.route('/')
  .get(getBikes)
  .post(protect, admin, upload.any(), createBike);

router.route('/:id')
  .get(getBikeById)
  .put(protect, admin, upload.any(), updateBike)
  .delete(protect, admin, deleteBike);

module.exports = router;
