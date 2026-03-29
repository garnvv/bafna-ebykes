import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const STEPS = { EMAIL: 'email', OTP: 'otp', PASSWORD: 'password', DONE: 'done' };

const ForgotPassword = () => {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 5000); };

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(STEPS.OTP);
      startCooldown();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) { showError('Please enter the 6-digit OTP.'); return; }
    setStep(STEPS.PASSWORD);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { showError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { showError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setStep(STEPS.DONE);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = [
    { id: STEPS.EMAIL, label: 'Email' },
    { id: STEPS.OTP, label: 'OTP' },
    { id: STEPS.PASSWORD, label: 'New Password' },
  ];

  const currentStepIndex = stepConfig.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[url('/auth-scooter.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-lg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/90 border border-gray-200 rounded-[32px] shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="px-10 pt-10 pb-6 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-[#1d1d1f] mb-1">Reset Password</h1>
            <p className="text-gray-500 text-sm font-medium">
              {step === STEPS.EMAIL && 'Enter your registered email to receive an OTP.'}
              {step === STEPS.OTP && `Enter the 6-digit OTP sent to ${email}`}
              {step === STEPS.PASSWORD && 'Create a new strong password.'}
              {step === STEPS.DONE && 'Your password has been reset!'}
            </p>
          </div>

          {/* Step indicators */}
          {step !== STEPS.DONE && (
            <div className="flex items-center justify-center gap-2 px-10 py-4 bg-[#f8f8fa]">
              {stepConfig.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${
                    i <= currentStepIndex ? 'text-primary' : 'text-gray-300'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                      i < currentStepIndex ? 'bg-primary text-white' : i === currentStepIndex ? 'bg-primary/20 text-primary border-2 border-primary' : 'bg-gray-100 text-gray-300'
                    }`}>
                      {i < currentStepIndex ? '✓' : i + 1}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < stepConfig.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full max-w-[40px] ${i < currentStepIndex ? 'bg-primary' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="px-10 py-8">
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step: Email */}
            {step === STEPS.EMAIL && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-4 pl-11 pr-4 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] font-medium"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                </button>
              </form>
            )}

            {/* Step: OTP */}
            {step === STEPS.OTP && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-4 px-4 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] font-black text-2xl tracking-[16px] text-center"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <p className="text-xs text-gray-400 text-center">Check your inbox at <span className="font-bold text-[#1d1d1f]">{email}</span></p>
                </div>
                <button
                  type="submit"
                  disabled={otp.length !== 6}
                  className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 shadow-lg shadow-primary/20"
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="w-full py-3 text-sm font-bold text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <RefreshCw className="w-4 h-4" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </form>
            )}

            {/* Step: New Password */}
            {step === STEPS.PASSWORD && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-4 pl-11 pr-4 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] font-medium"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-4 pl-11 pr-4 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] font-medium"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                {newPassword && confirmPassword && (
                  <p className={`text-xs font-bold flex items-center gap-1 ${newPassword === confirmPassword ? 'text-primary' : 'text-red-400'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Step: Done */}
            {step === STEPS.DONE && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-black text-[#1d1d1f] mb-2">Password Reset!</h2>
                <p className="text-gray-500 text-sm mb-8">Your password has been updated successfully. You can now log in with your new password.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== STEPS.DONE && (
            <div className="px-10 pb-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
