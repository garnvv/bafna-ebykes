const nodemailer = require('nodemailer');
const dns = require('dns');

// CRITICAL FIX: Render + Node 18+ defaults to IPv6, which Google SMTP aggressively blocks or hangs on. This forces IPv4.
dns.setDefaultResultOrder('ipv4first');

const { promisify } = require('util');
const lookupAsync = promisify(dns.lookup);

// ── Email Transporter ──────────────────────────────────────────────
/**
 * Create a robust Gmail SMTP transporter using an explicit, guaranteed IPv4 resolution.
 * This completely bypasses Render's broken IPv6 network routes (ENETUNREACH).
 */
const getTransporterAsync = async (portToTry = 465) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes('your_email')) {
    console.warn('[MAIL SKIP] Email credentials not configured or incomplete.');
    return null;
  }

  try {
    // 1. Force the OS to resolve solely an IPv4 address for Google's SMTP!
    const { address } = await lookupAsync('smtp.gmail.com', { family: 4 });
    const isSecure = portToTry === 465;
    
    // 2. Build the transporter using the raw IPv4 string, keeping 'servername' intact for TLS signatures.
    return nodemailer.createTransport({
      host: address, // Looks like: '142.251.167.108'
      port: portToTry,
      secure: isSecure,
      auth: { user, pass },
      debug: false,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      tls: {
        servername: 'smtp.gmail.com', // Crucial: Re-identifies to Google since providing an IP breaks naive SSL
        rejectUnauthorized: !isSecure
      }
    });
  } catch (dnsErr) {
    console.error('[MAIL ERROR] Extremely fatal DNS failure:', dnsErr.message);
    return null;
  }
};

/**
 * Generic email sending utility.
 * Replaces functionality from the old mail.js.
 */
const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  // [Email Disabled by Admin Request]
  // We instantly return true to simulate success. This immediately skips the 4-second SMTP wait,
  // drastically speeding up all App operations (Accepting test rides, servicing, and registration).
  console.log(`[MAIL DISABLED] Simulated delivery to ${to}. Subject: ${subject}`);
  return true;
};

/**
 * Send welcome email to newly onboarded customer
 */
const sendWelcomeEmail = async ({ name, email, customerId, password, vehicle }) => {
  console.log(`[MAIL DISABLED] Simulated Welcome Email to ${email}`);
  return true;
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

  const frontendUrl = process.env.FRONTEND_URL || 'https://bafna-frontend.onrender.com';
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
