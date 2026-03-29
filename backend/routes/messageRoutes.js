const express = require('express');
const router = express.Router();
const { sendMessage, getAllMessages, markMessageAsRead, deleteMessage } = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(sendMessage)
  .get(protect, admin, getAllMessages);

router.route('/:id')
  .put(protect, admin, markMessageAsRead)
  .delete(protect, admin, deleteMessage);

module.exports = router;
