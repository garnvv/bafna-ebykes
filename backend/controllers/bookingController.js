const { Booking, Bike, User } = require('../models');
const { sendWhatsApp, sendEmail } = require('../utils/notificationService');

// @desc    Create new booking (Test Ride)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { bikeId, bookingDate, timeSlot, notes } = req.body;

  try {
    // Check if slot is already booked for this bike
    const existingBooking = await Booking.findOne({
      where: { bikeId, bookingDate, timeSlot, status: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked for this bike' });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      bikeId,
      bookingDate,
      timeSlot,
      notes
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Bike, attributes: ['modelName', 'brand', 'images'] }]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: Bike, attributes: ['modelName', 'brand'] }
      ]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (booking) {
      booking.status = req.body.status || booking.status;
      await booking.save();

      // Trigger Notifications on Approval
      if (req.body.status === 'approved') {
        const fullBooking = await Booking.findByPk(booking.id, {
          include: [
            { model: User, attributes: ['name', 'email', 'phone'] },
            { model: Bike, attributes: ['modelName', 'brand'] }
          ]
        });

        const msg = `Hello, ${fullBooking.User.name}! 👋
        Your test ride has been *APPROVED* ✅

        🏍️ Bike: ${fullBooking.Bike.brand} ${fullBooking.Bike.modelName}
        📅 Date: ${fullBooking.bookingDate}
        ⏰ Time: ${fullBooking.timeSlot}

        See you soon! 😊`;

        await sendWhatsApp(fullBooking.User.phone, msg);
        await sendEmail(fullBooking.User.email, 'Test Ride Approved!', msg, `<h1>Approved!</h1><p>${msg}</p>`);
      }

      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
};
