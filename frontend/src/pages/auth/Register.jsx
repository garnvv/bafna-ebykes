import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
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
          <h1 className="text-3xl font-black mb-2 uppercase text-[#1d1d1f]">Join the Fleet</h1>
          <p className="text-gray-500 font-medium">Create your account to start your electric journey.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-500 text-sm">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                required 
                className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-3 pl-12 pr-6 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] shadow-sm" 
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required 
                className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-3 pl-12 pr-6 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] shadow-sm" 
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="tel" 
                className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-3 pl-12 pr-6 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] shadow-sm" 
                placeholder="+91..."
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required 
                className="w-full bg-[#f5f5f7] border border-transparent rounded-xl py-3 pl-12 pr-6 focus:bg-white focus:border-primary outline-none transition-all text-[#1d1d1f] shadow-sm" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="btn-primary w-full py-4 text-lg flex items-center justify-center font-black space-x-3 disabled:opacity-50 mt-4"
          >
            {loading ? "CREATING ACCOUNT..." : (
              <>
                <span>SIGN UP</span>
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-medium">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">Login here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
