const nodemailer = require('nodemailer');

// ── Email Transporter ──────────────────────────────────────────────
const getTransporter = () => nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send welcome email to newly onboarded customer
 */
const sendWelcomeEmail = async ({ name, email, customerId, password, vehicle }) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log('[Email] Email not configured — skipping. Set EMAIL_USER and EMAIL_PASS in .env');
    return;
  }

  const vehicleSection = vehicle
    ? `
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Vehicle</td><td style="padding:8px 0;font-weight:700">${vehicle.bike}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Vehicle Reg ID</td><td style="padding:8px 0;font-size:20px;font-weight:900;color:#10b981;font-family:monospace">${vehicle.vehicleRegId}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">VIN / Chassis</td><td style="padding:8px 0;font-family:monospace">${vehicle.vin}</td></tr>
      ${vehicle.nextServiceDate ? `<tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Next Service Due</td><td style="padding:8px 0;font-weight:700;color:#f97316">${vehicle.nextServiceDate}</td></tr>` : ''}
    ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',sans-serif;color:#fff">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px">

        <div style="text-align:center;margin-bottom:40px">
          <h1 style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#10b981;margin:0">⚡ BAFNA E-BYKES</h1>
          <p style="color:#6b7280;margin:8px 0 0">Welcome to the Future of Mobility</p>
        </div>

        <div style="background:#111;border:1px solid #1f2937;border-radius:24px;padding:40px">
          <h2 style="font-size:22px;font-weight:900;margin:0 0 8px">Welcome, ${name}</h2>
          <p style="color:#9ca3af;margin:0 0 32px">
            Your BAFNA E-BYKES account has been created by our showroom team.<br/>
            Here are your credentials and vehicle details.<br/>
            Please keep them safe!
          </p>

          <table style="width:100%;border-collapse:collapse;border-top:1px solid #1f2937">
            <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Customer ID</td><td style="padding:8px 0;font-size:20px;font-weight:900;color:#10b981;font-family:monospace">${customerId}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Email</td><td style="padding:8px 0;font-weight:700">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#9ca3af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px">Password</td><td style="padding:8px 0"><code style="background:#1f2937;padding:4px 12px;border-radius:8px;font-size:14px">${password}</code></td></tr>
            ${vehicleSection}
          </table>

          <div style="margin-top:32px;background:#0f1f1a;border:1px solid #10b981;border-radius:16px;padding:20px;text-align:center">
            <p style="margin:0;font-size:12px;color:#10b981;font-weight:700;text-transform:uppercase;letter-spacing:2px">Login at</p>
            <p style="margin:8px 0 0;font-size:16px;font-weight:700">http://localhost:5173/login</p>
          </div>

          <p style="margin-top:24px;font-size:12px;color:#6b7280;text-align:center">
            Please change your password after first login.<br/>
            Contact the showroom if you have any questions.
          </p>
        </div>

        <p style="text-align:center;color:#374151;font-size:11px;margin-top:24px">
          © 2026 BAFNA E-BYKES. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await getTransporter().sendMail({
      from: `"BAFNA E-BYKES" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `⚡ Welcome to BAFNA E-BYKES — Your Account is Ready!`,
      html
    });
    console.log(`[Email] Welcome email sent to ${email}`);
  } catch (err) {
    console.error('[Email] Failed to send welcome email:', err.message);
  }
};

/**
 * Build a WhatsApp API URL (wa.me deep link) with a pre-filled message.
 * Returns the URL string — the backend can log it or store it.
 * For real sending, integrate Twilio WhatsApp API or Meta Cloud API.
 */
const buildWhatsAppMessage = ({ name, customerId, password, vehicle, phone }) => {
  let message = `Welcome to BAFNA E-BYKES, ${name}\n\n`;
  message += `Your account has been created:\n`;
  message += `Customer ID: ${customerId}\n`;
  message += `Password: ${password}\n`;

  if (vehicle) {
    message += `\nYour Vehicle:\n`;
    message += `Vehicle Reg ID: ${vehicle.vehicleRegId}\n`;
    message += `VIN: ${vehicle.vin}\n`;
    message += `Model: ${vehicle.bike}\n`;
    if (vehicle.nextServiceDate) {
      message += `Next Service: ${vehicle.nextServiceDate}\n`;
    }
  }

  message += `\nLogin: http://localhost:5173/login\n\n`;
  message += `Give your Feedback: http://localhost:5173/feedback\n\n`;
  message += `BAFNA E-BYKES\n`;
  message += `24, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra - 425405\n`;
  message += `Contact: 7558533371 / 7709616271\n`;
  message += `Email: bafnaebykes@gmail.com`;

  const clean = (phone || '').replace(/[^\d]/g, '');
  const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;

  console.log(`[WhatsApp] Link for ${name}: ${waUrl}`);
  return { message, waUrl };
};

module.exports = { sendWelcomeEmail, buildWhatsAppMessage };
