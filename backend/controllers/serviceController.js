const { Service, User, Vehicle, Bike } = require('../models');
const { sendWhatsApp, sendEmail } = require('../utils/notificationService');

// @desc    Create new service request
// @route   POST /api/services
// @access  Private
const createService = async (req, res) => {
  const { serviceType, appointmentDate, description } = req.body;

  try {
    const service = await Service.create({
      userId: req.user.id,
      serviceType,
      appointmentDate,
      description
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user services
// @route   GET /api/services/myservices
// @access  Private
const getMyServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { userId: req.user.id }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all services (Admin)
// @route   GET /api/services
// @access  Private/Admin
const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service status
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateServiceStatus = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (service) {
      service.status = req.body.status || service.status;

      if (req.body.items) {
        service.items = req.body.items;
        // Calculate total cost from items: price * quantity
        const total = req.body.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
        service.cost = total;
        service.changed('items', true);
        service.changed('cost', true);
      } else if (req.body.cost !== undefined) {
        service.cost = req.body.cost;
        service.changed('cost', true);
      }

      await service.save();

      // Trigger Notifications on Approval
      if (req.body.status === 'approved') {
        const fullService = await Service.findByPk(service.id, {
          include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
        });

        const branding = `\n\nGive your Feedback: http://localhost:5173/feedback\n\nBAFNA E-BYKES\n24, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra - 425405\nContact: 7558533371 / 7709616271\nEmail: bafnaebykes@gmail.com`;
        const msg = `Hello, ${fullService.User.name}\n\nYour service appointment has been APPROVED\n\nDate: ${fullService.appointmentDate}\n\nPlease bring your vehicle to the showroom${branding}`;

        await sendWhatsApp(fullService.User.phone, msg);
        const htmlMsg = `<h1>Service Approved</h1><p>Hello, ${fullService.User.name},</p><p>Your service appointment has been APPROVED.</p><p>Date: ${fullService.appointmentDate}</p><p>Please bring your vehicle to the showroom.</p><p>BAFNA E-BYKES</p>`;
        await sendEmail(fullService.User.email, 'Service Appointment Approved', msg, htmlMsg);
      }

      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Generate Service Bill PDF
// @route   GET /api/services/:id/invoice
// @access  Private
const { generateServiceInvoiceBuffer } = require('../utils/pdfGenerator');

const getServiceInvoice = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: Vehicle, attributes: ['vin', 'vehicleRegId', 'purchaseDate'], include: [Bike] }
      ]
    });

    if (!service) return res.status(404).json({ message: 'Service not found' });

    const buffer = await generateServiceInvoiceBuffer(service);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createService,
  getMyServices,
  getAllServices,
  updateServiceStatus,
  getServiceInvoice
};
