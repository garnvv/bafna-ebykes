/**
 * Notification Service — delegates to the unified notify.js
 * This file exists for backward compatibility with older imports.
 */
const { sendEmail: unifiedSendEmail } = require('./notify');

// Mock WhatsApp Sender (logs to console)
const sendWhatsApp = async (phone, message) => {
  console.log(`[WHATSAPP MOCK] To: ${phone}`);
  return true;
};

// Email Sender — uses the unified, robust notify.js engine
const sendEmail = async (to, subject, text, html, attachments = []) => {
  // Support both old (positional args) and new (object) calling conventions
  if (typeof to === 'object') {
    return unifiedSendEmail(to);
  }
  return unifiedSendEmail({ to, subject, text, html, attachments });
};

module.exports = { sendWhatsApp, sendEmail };

