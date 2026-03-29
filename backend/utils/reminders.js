const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Reminder, User } = require('../models');
const { Op } = require('sequelize');

// Configure Nodemailer (Use your email service details)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running reminder check...');

  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  try {
    const pendingReminders = await Reminder.findAll({
      where: {
        remindAt: {
          [Op.lte]: oneHourFromNow,
          [Op.gt]: now
        },
        status: 'pending'
      },
      include: [{ model: User, attributes: ['email', 'name'] }]
    });

    for (const reminder of pendingReminders) {
      // Send Email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: reminder.User.email,
        subject: 'BAFNA E-BYKES Reminder',
        text: `Hello, ${reminder.User.name},\n\nThis is a reminder: ${reminder.message}\n\nRide safe,\nBAFNA E-BYKES Team`
      };

      try {
        await transporter.sendMail(mailOptions);
        reminder.status = 'sent';
      } catch (error) {
        console.error(`Failed to send email to ${reminder.User.email}`, error);
        reminder.status = 'failed';
      }
      await reminder.save();
    }
  } catch (error) {
    console.error('CRON Error:', error);
  }
});

module.exports = cron;
