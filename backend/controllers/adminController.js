const { User, Booking, Service, Bike, Feedback, Message, Reminder, Vehicle, StockItem, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendWelcomeEmail, sendNotificationEmail, sendEmail, buildWhatsAppMessage } = require('../utils/notify');
const { sendWhatsApp } = require('../utils/notificationService');
const { generateAndSaveInvoice } = require('../utils/pdfGenerator');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalBookings = await Booking.count();
    const totalServices = await Service.count();
    const totalBikes = await Bike.count();

    const recentBookings = await Booking.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['name'] },
        { model: Bike, attributes: ['modelName'] }
      ]
    });

    const recentFeedback = await Feedback.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name'] }]
    });

    // Monthly data for charts (Last 6 months)
    const monthlyBookings = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date();
      startOfMonth.setMonth(startOfMonth.getMonth() - i);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const count = await Booking.count({
        where: {
          createdAt: {
            [Op.gte]: startOfMonth,
            [Op.lt]: endOfMonth
          }
        }
      });

      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });
      monthlyBookings.push({ month: monthName, count });
    }

    res.json({
      summary: {
        totalUsers,
        totalBookings,
        totalServices,
        totalBikes
      },
      recentBookings,
      recentFeedback,
      chartData: monthlyBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] }
    });
    console.log(`System found ${users.length} users for admin.`);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = status;
    await booking.save();

    // Trigger Notifications on Approval
    if (status === 'approved') {
      const fullBooking = await Booking.findByPk(booking.id, {
        include: [
          { model: User, attributes: ['name', 'email', 'phone'] },
          { model: Bike, attributes: ['modelName', 'brand'] }
        ]
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const branding = `\n\nGive your Feedback: ${frontendUrl}/feedback\n\nBAFNA E-BYKES\n24, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra - 425405\nContact: 7558533371 / 7709616271\nEmail: bafnaebykes@gmail.com`;
      const msg = `Hello, ${fullBooking.User.name}\n\nYour test ride for ${fullBooking.Bike.brand} ${fullBooking.Bike.modelName} is APPROVED\n\nDate: ${fullBooking.bookingDate}\nTime: ${fullBooking.timeSlot}${branding}`;

      await sendWhatsApp(fullBooking.User.phone, msg).catch(err => console.error('[WhatsApp Error]', err.message));
      const htmlMsg = `<h1>Test Ride Approved</h1><p>Hello, ${fullBooking.User.name},</p><p>Your test ride for ${fullBooking.Bike.brand} ${fullBooking.Bike.modelName} is APPROVED.</p><p>Date: ${fullBooking.bookingDate}<br/>Time: ${fullBooking.timeSlot}</p><p>BAFNA E-BYKES</p>`;
      await sendEmail({ to: fullBooking.User.email, subject: 'Test Ride Approved', text: msg, html: htmlMsg });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, items, cost } = req.body;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (status) service.status = status;

    if (items) {
      service.items = items;
      // Calculate total cost from items: price * quantity
      const total = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
      service.cost = total;
      service.changed('items', true);
      service.changed('cost', true);
    } else if (cost !== undefined) {
      service.cost = cost;
      service.changed('cost', true);
    }

    await service.save();

    // ── Completion Logic (Billing & Stock) ──────────────────────────
    if (status === 'completed') {
      const fullService = await Service.findByPk(service.id, {
        include: [
          { model: User, attributes: ['name', 'email', 'phone'] },
          { model: Vehicle, attributes: ['vin', 'vehicleRegId'], include: [Bike] }
        ]
      });

      // 1. Deduct Stock
      if (items && items.length > 0) {
        for (const item of items) {
          if (item.stockItemId) {
            try {
              const stockItem = await StockItem.findByPk(item.stockItemId);
              if (stockItem) {
                stockItem.quantity = Math.max(0, stockItem.quantity - Number(item.quantity || 1));
                await stockItem.save();
                console.log(`[Stock] Deducted ${item.quantity} of ${stockItem.name}`);
              }
            } catch (stockErr) {
              console.error(`[Stock Error] Failed to deduct ${item.name}:`, stockErr.message);
            }
          }
        }
      }

      // 2. Generate PDF, save it, and send notifications
      try {
        const invoice = await generateAndSaveInvoice(fullService);

        // WhatsApp message — includes direct download link to the PDF
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const branding = `\n\nGive your Feedback: ${frontendUrl}/feedback\n\nBAFNA E-BYKES\n24, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra - 425405\nContact: 7558533371 / 7709616271\nEmail: bafnaebykes@gmail.com`;

        const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
        const pdfUrl = `${baseUrl}/api/services/${fullService.id}/invoice`;

        const msg = `Hello, ${fullService.User.name}\n\nYour service appointment is COMPLETED\n\nTotal Bill: Rs. ${Number(service.cost).toFixed(2)}\n\nDownload Your Invoice (PDF):\n${pdfUrl}\n\nThe invoice has also been sent to your email.${branding}`;

        await sendWhatsApp(fullService.User.phone, msg).catch(err => console.error('[WhatsApp Error]', err.message));

        // Email — attach PDF buffer directly
        const htmlMsg = `<h1>Service Invoice</h1><p>Hello, ${fullService.User.name},</p><p>Your service for <b>${fullService.Vehicle?.Bike?.modelName || 'your vehicle'}</b> is now complete.</p><p>Total Amount Payable: <b>&#8377;${Number(service.cost).toFixed(2)}</b></p><p>Please find your invoice attached to this email. You can also download it here: <a href="${pdfUrl}">Invoice_#SRV-${fullService.id}.pdf</a></p><p>BAFNA E-BYKES</p>`;

        await sendEmail({
          to: fullService.User.email,
          subject: 'Service Invoice - BAFNA E-BYKES',
          text: msg,
          html: htmlMsg,
          attachments: [{ filename: invoice.filename, content: invoice.buffer }]
        });

        console.log(`[Invoice] Saved: ${invoice.filePath}`);
        console.log(`[Invoice] Public URL: ${invoice.publicUrl}`);
      } catch (pdfErr) {
        console.error('[PDF/Email Error]', pdfErr.message);
      }
    }

    // ── Approval Logic ──────────────────────────────────────────────
    if (status === 'approved') {
      const fullService = await Service.findByPk(service.id, {
        include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const branding = `\n\nGive your Feedback: ${frontendUrl}/feedback\n\nBAFNA E-BYKES\n24, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra - 425405\nContact: 7558533371 / 7709616271\nEmail: bafnaebykes@gmail.com`;
      const msg = `Hello, ${fullService.User.name}\n\nYour service appointment has been APPROVED\n\nDate: ${fullService.appointmentDate}\n\nPlease bring your vehicle to the showroom${branding}`;

      await sendWhatsApp(fullService.User.phone, msg).catch(err => console.error('[WhatsApp Error]', err.message));
      const htmlMsg = `<h1>Service Approved</h1><p>Hello, ${fullService.User.name},</p><p>Your service appointment has been APPROVED.</p><p>Date: ${fullService.appointmentDate}</p><p>Please bring your vehicle to the showroom.</p><p>BAFNA E-BYKES</p>`;
      await sendEmail({ to: fullService.User.email, subject: 'Service Appointment Approved', text: msg, html: htmlMsg });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const triggerManualReminder = async (req, res) => {
  try {
    const { userId, message } = req.body;

    // 1. Save reminder to DB
    await Reminder.create({ userId, message, remindAt: new Date(), type: 'manual', status: 'sent' });

    // 2. Fetch the user
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 3. Send Email (if configured)
    // 3. Send Email
    try {
      await sendNotificationEmail({
        to: user.email,
        subject: '⚡ Reminder from BAFNA E-BYKES',
        message: message
      });
      console.log(`[Reminder] Email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('[Reminder] Email failed:', emailErr.message);
    }

    // 4. Build WhatsApp deep-link
    const phone = user.whatsapp || user.phone || '';
    const clean = phone.replace(/[^\d]/g, '');
    let waUrl = null;
    if (clean) {
      const waText = `🏍️ *BAFNA E-BYKES Reminder*\n\nHi ${user.name},\n\n${message}\n\n_— BAFNA E-BYKES Team_`;
      waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(waText)}`;
    }

    res.json({ message: 'Reminder sent', emailSent: !!waUrl || true, waUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const broadcastMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const users = await User.findAll({ where: { role: 'user' } });

    const reminders = users.map(user => ({
      userId: user.id,
      message,
      remindAt: new Date(),
      type: 'broadcast',
      status: 'pending'
    }));

    await Reminder.bulkCreate(reminders);
    res.json({ message: `Broadcast sent to ${users.length} users.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [bookings, services] = await Promise.all([
      Booking.findAll({ where: { userId: id }, include: [Bike] }),
      Service.findAll({ where: { userId: id } })
    ]);
    res.json({ bookings, services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerVehicle = async (req, res) => {
  try {
    const { userId, bikeId, vin, purchaseDate, color, nextServiceDate, serviceIntervalDays, notes } = req.body;

    // Auto-generate a unique Vehicle Registration ID: BAF-XXXXXX
    const vehicleRegId = 'BAF-VH-' + Date.now().toString(36).toUpperCase();

    const vehicle = await Vehicle.create({
      vehicleRegId,
      userId,
      bikeId,
      vin,
      color,
      purchaseDate: purchaseDate || new Date(),
      nextServiceDate: nextServiceDate || null,
      serviceIntervalDays: serviceIntervalDays || 90,
      notes
    });

    // Return vehicle with bike and user details
    const full = await Vehicle.findByPk(vehicle.id, {
      include: [
        { model: Bike, as: 'Bike', attributes: ['modelName', 'brand', 'mainImage'] },
        { model: User, as: 'User', attributes: ['name', 'email', 'customerId'] }
      ]
    });

    res.status(201).json(full);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, whatsapp, address, vehicleCategory } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Auto-generate unique Customer ID: BAF-CX-XXXXXX
    const customerId = 'BAF-CX-' + Date.now().toString(36).toUpperCase();

    const user = await User.create({
      customerId,
      name,
      email,
      password,
      phone,
      whatsapp,
      address,
      vehicleCategory,
      role: 'user'
    });

    res.status(201).json({
      id: user.id,
      customerId: user.customerId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsapp: user.whatsapp,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Combined: Create User + Register Vehicle in one transaction
const onboardCustomer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      // User fields
      name, email, password, phone, whatsapp, address, vehicleCategory,
      // Vehicle fields
      bikeId, vin, color, purchaseDate, nextServiceDate, serviceIntervalDays, notes
    } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ where: { email }, transaction: t });
    if (userExists) {
      await t.rollback();
      return res.status(400).json({ message: 'A customer with this email already exists' });
    }

    // 2. Auto-generate unique Customer ID
    const customerId = 'BAF-CX-' + Date.now().toString(36).toUpperCase();

    // 3. Create User
    const user = await User.create({
      customerId, name, email, password, phone, whatsapp, address, vehicleCategory, role: 'user'
    }, { transaction: t });

    // 4. Register Vehicle (if bikeId and vin provided)
    let vehicle = null;
    if (bikeId && vin) {
      const vehicleRegId = 'BAF-VH-' + Date.now().toString(36).toUpperCase();
      vehicle = await Vehicle.create({
        vehicleRegId,
        userId: user.id,
        bikeId,
        vin,
        color,
        purchaseDate: purchaseDate || new Date(),
        nextServiceDate: nextServiceDate || null,
        serviceIntervalDays: serviceIntervalDays || 90,
        notes
      }, { transaction: t });
    }

    await t.commit();

    // 5. Fetch bike details for response
    const bike = bikeId ? await Bike.findByPk(bikeId, { attributes: ['modelName', 'brand'] }) : null;
    const bikeName = bike ? `${bike.brand} ${bike.modelName}` : null;

    const vehiclePayload = vehicle ? {
      vehicleRegId: vehicle.vehicleRegId,
      vin: vehicle.vin,
      color: vehicle.color,
      nextServiceDate: vehicle.nextServiceDate,
      bike: bikeName
    } : null;

    // 6. Send welcome email (blocking for reliability)
    await sendWelcomeEmail({
      name, email,
      customerId: user.customerId,
      password, // plain text before hash — captured before ORM hook
      vehicle: vehiclePayload
    }).catch(err => console.error('[Email Error]', err.message));

    // 7. Build WhatsApp deep-link (returns URL admin can click to send message)
    const whatsappContact = whatsapp || phone;
    const { waUrl } = buildWhatsAppMessage({
      name,
      customerId: user.customerId,
      password,
      vehicle: vehiclePayload,
      phone: whatsappContact
    });

    res.status(201).json({
      customer: {
        id: user.id,
        customerId: user.customerId,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      vehicle: vehiclePayload,
      whatsappUrl: whatsappContact ? waUrl : null
    });

  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};


// @desc Delete a customer (and their vehicles)
// @route DELETE /api/admin/customers/:id
// @access Private/Admin
const deleteCustomer = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'user' }, transaction: t });
    if (!user) { await t.rollback(); return res.status(404).json({ message: 'Customer not found' }); }
    // Delete vehicles first (foreign key constraint)
    await Vehicle.destroy({ where: { userId: user.id }, transaction: t });
    await user.destroy({ transaction: t });
    await t.commit();
    res.json({ message: `Customer ${user.name} and their vehicles deleted successfully` });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a customer's basic info
// @route PUT /api/admin/customers/:id
// @access Private/Admin
const updateCustomer = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'user' } });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    const { name, phone, whatsapp, address, vehicleCategory } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (whatsapp !== undefined) user.whatsapp = whatsapp;
    if (address !== undefined) user.address = address;
    if (vehicleCategory !== undefined) user.vehicleCategory = vehicleCategory;
    await user.save();
    res.json({ message: 'Customer updated', customer: { id: user.id, name: user.name, email: user.email, phone: user.phone, customerId: user.customerId } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.destroy();
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await service.destroy();
    res.json({ message: 'Service record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
