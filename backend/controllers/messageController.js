const { Message } = require('../models');

// @desc    Send a message (Contact Form)
// @route   POST /api/messages
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/messages
// @access  Private/Admin
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update message read status
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
const markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (message) {
      message.isRead = true;
      await message.save();
      res.json(message);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (message) {
      await message.destroy();
      res.json({ message: 'Message deleted' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
  markMessageAsRead,
  deleteMessage
};
