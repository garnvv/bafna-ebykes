const { Feedback, User, Bike } = require('../models');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
  const { bikeId, rating, comment, type } = req.body;

  try {
    const feedback = await Feedback.create({
      userId: req.user.id,
      bikeId: type === 'bike' ? bikeId : null,
      rating,
      comment,
      type
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Bike, attributes: ['modelName'] }
      ]
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get feedback for a bike
// @route   GET /api/feedback/bike/:id
// @access  Public
const getBikeFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findAll({
      where: { bikeId: req.params.id, type: 'bike' },
      include: [{ model: User, attributes: ['name'] }]
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback (Admin)
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Review not found' });
    await feedback.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getBikeFeedback,
  deleteFeedback
};
