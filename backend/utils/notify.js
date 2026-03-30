const nodemailer = require('nodemailer');

// ── Email Transporter ──────────────────────────────────────────────
/**
 * Create a robust Gmail SMTP transporter.
 * Using explicit host/port/secure settings is more reliable than service: 'gmail'.
 */
const getTransporter = (portToTry = 465) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes('your_email')) {
    console.warn('[MAIL SKIP] Email credentials not configured or incomplete.');
    return null;
  }

  const isSecure = portToTry === 465;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: portToTry,
    secure: isSecure,
    auth: { user, pass },
    debug: true,
    logger: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: isSecure ? undefined : { rejectUnauthorized: false }
  });
};

/**
 * Generic email sending utility.
 * Replaces functionality from the old mail.js.
 */
const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  let transporter = getTransporter(465); // Try 465 first
  if (!transporter) return false;

  try {
    const info = await transporter.sendMail({
      from: `"BAFNA E-BYKES" <${process.env.EMAIL_USER}>`,
      to, subject, text, html, attachments
    });
    console.log(`[MAIL SUCCESS] Sent to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.warn(`[MAIL WARNING] Port 465 failed: ${error.message}. Trying Port 587 Fallback...`);
    
    // Try Fallback on Port 587
    const fallbackTransporter = getTransporter(587);
    if (!fallbackTransporter) return false;

    try {
      const info = await fallbackTransporter.sendMail({
        from: `"BAFNA E-BYKES" <${process.env.EMAIL_USER}>`,
        to, subject, text, html, attachments
      });
      console.log(`[MAIL SUCCESS] Fallback (Port 587) delivered to ${to}. MessageId: ${info.messageId}`);
      return true;
    } catch (fError) {
      console.error('[MAIL ERROR] Both ports (465 & 587) failed.');
      console.error('Final Error:', fError.message);
      return false;
    }
  }
};

/**
 * Send welcome email to newly onboarded customer
 */
const sendWelcomeEmail = async ({ name, email, customerId, password, vehicle }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[Email] Skip welcome email — credentials missing.');
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
            <p style="margin:8px 0 0;font-size:16px;font-weight:700">${process.env.FRONTEND_URL || 'http://localhost:5173'}/login</p>
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
    await transporter.sendMail({
      from: `"BAFNA E-BYKES" <${process.env.EMAIL_USER}>`,
      to,
      subject: `⚡ Welcome to BAFNA E-BYKES — Your Account is Ready!`,
      html
    });
    console.log(`[Email] Welcome email sent to ${email}`);
    return true;
  } catch (err) {
    console.error('[Email Failed] sendWelcomeEmail:', err.message);
    return false;
  }
};

/**
 * Send a generic notification email
 */
const sendNotificationEmail = async ({ to, subject, message, title = '⚡ BAFNA E-BYKES' }) => {
  const html = `
    <div style="background:#0a0a0a;padding:40px;font-family:sans-serif;color:#fff;max-width:600px;margin:0 auto">
      <h2 style="color:#10b981;font-size:22px;margin:0 0 8px">${title}</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:13px">Official Update from the Showroom Team</p>
      <div style="background:#111;border:1px solid #1f2937;border-radius:16px;padding:24px">
        <p style="margin:0;font-size:15px;line-height:1.7;color:#e5e7eb">${message}</p>
      </div>
      <p style="margin-top:24px;font-size:11px;color:#374151;text-align:center">© 2026 BAFNA E-BYKES</p>
    </div>`;

  return sendEmail({ to, subject, text: message, html });
};

/**
 * Build a WhatsApp API URL (wa.me deep link)
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

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  message += `\nLogin: ${frontendUrl}/login\n\n`;
  message += `Give your Feedback: ${frontendUrl}/feedback\n\n`;
  message += `BAFNA E-BYKES\n`;
  message += `24, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra - 425405\n`;
  message += `Contact: 7558533371 / 7709616271\n`;
  message += `Email: bafnaebykes@gmail.com`;

  const clean = (phone || '').replace(/[^\d]/g, '');
  const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;

  console.log(`[WhatsApp] Link for ${name}: ${waUrl}`);
  return { message, waUrl };
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
  buildWhatsAppMessage
};
