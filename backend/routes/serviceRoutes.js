const express = require('express');
const router = express.Router();
const { createService, getMyServices, getAllServices, updateServiceStatus, getServiceInvoice } = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createService)
  .get(protect, admin, getAllServices);

router.get('/myservices', protect, getMyServices);
router.get('/:id/invoice', protect, getServiceInvoice);
router.put('/:id', protect, admin, updateServiceStatus);

module.exports = router;
