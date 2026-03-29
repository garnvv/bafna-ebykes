const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback, getBikeFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createFeedback)
  .get(protect, admin, getAllFeedback);

router.get('/bike/:id', getBikeFeedback);

// DELETE a specific review (admin only)
router.delete('/:id', protect, admin, deleteFeedback);

module.exports = router;
