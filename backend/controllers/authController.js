const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { sendEmail, sendWelcomeEmail, buildWhatsAppMessage } = require('../utils/notify');
const crypto = require('crypto');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Store OTPs in memory (in production use Redis)
const otpStore = new Map(); // email -> { otp, expiry }

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found in DB');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      console.log('Login successful');
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      console.log('Password mismatch');
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    await User.count();
    res.json({ 
      status: 'OK', 
      database: 'Connected', 
      env: process.env.NODE_ENV,
      port: process.env.PORT 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'Error', 
      database: 'Disconnected', 
      error: err.message 
    });
  }
};

// @desc    Register (disabled)
const registerUser = async (req, res) => {
  return res.status(403).json({ message: 'Public registration is disabled. Please contact the showroom for an account.' });
};

// @desc    Get profile
const getUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user) {
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Send OTP to email for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(`[Forgot Password] Request received for: ${email}`);
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[Forgot Password] User not found: ${email}`);
      return res.json({ message: 'If that email is registered, an OTP has been sent.' });
    }

    console.log(`[Forgot Password] Generating OTP for: ${user.name}`);
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    otpStore.set(email.toLowerCase(), { otp, expiry });

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:16px;border:1px solid #eee;">
        <h2 style="color:#10b981;">BAFNA E-BYKES</h2>
        <h3>Password Reset OTP</h3>
        <p>Hello ${user.name},</p>
        <p>Use the OTP below to reset your password. It expires in <b>15 minutes</b>.</p>
        <div style="font-size:40px;font-weight:900;letter-spacing:12px;text-align:center;color:#10b981;padding:24px;background:#f0fdf4;border-radius:12px;margin:24px 0;">
          ${otp}
        </div>
        <p style="color:#999;font-size:12px;">If you did not request this, please ignore this email.</p>
        <p style="color:#999;font-size:12px;">BAFNA E-BYKES | Shirpur, Maharashtra</p>
      </div>
    `;

    const text = `Your OTP is: ${otp} (valid for 15 minutes)`;
    
    // Send email in background - DO NOT AWAIT - to keep UI responsive
    sendEmail({ to: email, subject: 'Your Password Reset OTP', text, html })
      .catch(err => console.error('[OTP EMAIL BACKGROUND ERROR]', err.message));

    // Return success immediately so frontend moves to OTP entry screen
    return res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('[Forgot Password Error]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const record = otpStore.get(email.toLowerCase());

    if (!record) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }
    if (Date.now() > record.expiry) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = newPassword; // model hook will hash it
    await user.save();

    otpStore.delete(email.toLowerCase());

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword, getStatus };
