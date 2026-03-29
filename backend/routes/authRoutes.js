const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', authController.getStatus);
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/profile', protect, authController.getUserProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
