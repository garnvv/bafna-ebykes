const express = require('express');
const router = express.Router();
const { 
  getAnalytics, 
  getUsers, 
  getUserHistory,
  updateBookingStatus, 
  updateServiceStatus, 
  triggerManualReminder,
  broadcastMessage,
  registerVehicle,
  createUser,
  onboardCustomer,
  deleteCustomer,
  updateCustomer,
  deleteBooking,
  deleteService
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/analytics', protect, admin, getAnalytics);
router.get('/users', protect, admin, getUsers);
router.get('/users/:id/history', protect, admin, getUserHistory);
router.post('/register-vehicle', protect, admin, registerVehicle);
router.post('/create-user', protect, admin, createUser);
router.post('/onboard-customer', protect, admin, onboardCustomer);
router.delete('/bookings/:id', protect, admin, deleteBooking);
router.delete('/services/:id', protect, admin, deleteService);
router.post('/bookings/delete/:id', protect, admin, deleteBooking);
router.post('/services/delete/:id', protect, admin, deleteService);
router.patch('/bookings/:id', protect, admin, updateBookingStatus);
router.patch('/services/:id', protect, admin, updateServiceStatus);
router.post('/reminders', protect, admin, triggerManualReminder);
router.post('/broadcast', protect, admin, broadcastMessage);
router.put('/customers/:id', protect, admin, updateCustomer);
router.delete('/customers/:id', protect, admin, deleteCustomer);

// Sales by date range — count vehicles registered, sum revenue, return customer detail
router.get('/sales-by-date', protect, admin, async (req, res) => {
  try {
    const { Vehicle, Bike, User } = require('../models');
    const { Op } = require('sequelize');
    const { fromDate, toDate } = req.query;
    if (!fromDate || !toDate) return res.status(400).json({ message: 'fromDate and toDate query params required' });
    const start = new Date(fromDate); start.setHours(0,0,0,0);
    const end = new Date(toDate); end.setHours(23,59,59,999);
    const vehicles = await Vehicle.findAll({
      where: { purchaseDate: { [Op.between]: [start, end] } },
      include: [
        { model: Bike, attributes: ['price', 'modelName', 'brand'] },
        { model: User, attributes: ['name', 'email', 'customerId', 'phone'] }
      ],
      order: [['purchaseDate', 'DESC']]
    });
    const profit = vehicles.reduce((sum, v) => sum + (Number(v.Bike?.price) || 0), 0);
    const sales = vehicles.map(v => ({
      vehicleRegId: v.vehicleRegId,
      vin: v.vin,
      purchaseDate: v.purchaseDate,
      bikeName: v.Bike ? `${v.Bike.brand} ${v.Bike.modelName}` : '—',
      price: Number(v.Bike?.price) || 0,
      customerName: v.User?.name || '—',
      customerEmail: v.User?.email || '—',
      customerId: v.User?.customerId || '—',
      phone: v.User?.phone || '—'
    }));
    res.json({ count: vehicles.length, profit, fromDate, toDate, sales });
  } catch (e) { res.status(500).json({ message: e.message }); }
});



module.exports = router;
