const express = require('express');
const router = express.Router();
const { getMyVehicles } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/myvehicles', protect, getMyVehicles);

module.exports = router;
