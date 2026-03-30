const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, admin, resolveUser } = require('../middleware/authMiddleware');

router.route('/')
  .post(resolveUser, createBooking)
  .get(protect, admin, getAllBookings);

router.get('/mybookings', protect, getMyBookings);
router.put('/:id', protect, admin, updateBookingStatus);

module.exports = router;
