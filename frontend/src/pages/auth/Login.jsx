import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      // replace: true removes /login from history so back button can't return to it
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center px-4 bg-[url('/auth-scooter.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-lg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-10 bg-white/90 border border-gray-200 rounded-[32px] shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2 uppercase text-[#1d1d1f]">Welcome Back</h1>
          <p className="text-gray-500 font-medium">Enter your credentials to access your bafna account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-500 text-sm">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-4 pl-12 pr-6 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-4 pl-12 pr-12 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="btn-primary w-full py-5 text-lg flex items-center justify-center font-black space-x-3 disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : (
              <>
                <span>LOGIN</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 font-medium">
          🔒 Account access is exclusively managed by <span className="text-primary font-bold">BAFNA E-BYKES</span>. Contact the showroom for access.
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
