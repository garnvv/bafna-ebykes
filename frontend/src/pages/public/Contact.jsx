import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Buy a New Bike',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/messages', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: 'Buy a New Bike', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl font-black uppercase tracking-tight mb-6 text-[#1d1d1f]"
          >
            Connect With BAFNA E-BYKES.
          </motion.h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Experience the future of mobility at our premium showrooms. Our experts are ready to guide your electric journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: Phone, label: "Call Us", details: "+91 75585 33371", sub: "77096 16271", link: "tel:+917558533371" },
                { icon: Mail, label: "Email Us", details: "bafnaebykes@gmail.com", sub: "24/7 Support", link: "mailto:bafnaebykes@gmail.com" },
                { icon: MapPin, label: "Visit Us", details: "Shirpur, Dist. Dhule", sub: "Plot No. 24, Sai Baba Colony", link: "https://goo.gl/maps/9V4Q+F8" },
                { icon: Clock, label: "Showroom Hours", details: "10:00 AM - 08:30 PM", sub: "Sunday Closed" }
              ].map((item, i) => (
                <div key={i} className="bg-[#f5f5f7] p-8 rounded-[32px] border border-transparent hover:border-gray-200 transition-all text-center flex flex-col items-center">
                  <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <item.icon className="w-8 h-8 text-[#1d1d1f]" />
                  </div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{item.label}</h3>
                  {item.link ? (
                    <a href={item.link} className="font-extrabold text-xl text-[#1d1d1f] tracking-tight hover:text-primary transition-colors">
                      {item.details}
                    </a>
                  ) : (
                    <p className="font-extrabold text-xl text-[#1d1d1f] tracking-tight">{item.details}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2 font-medium">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[40px] overflow-hidden border border-gray-100 shadow-sm h-[400px] bg-[#f5f5f7]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3714.341484252516!2d74.88636137595083!3d21.346805576856526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39be57a8a1435213%3A0xd68994324f2b1d03!2s9V4Q%2BF8%2C%20Shirpur%2C%20Maharashtra%20425405!5e0!3m2!1sen!2sin!4v1711555555555!5m2!1sen!2sin"
                className="w-full h-full grayscale opacity-80 border-none mix-blend-multiply"
                allowFullScreen=""
                loading="lazy"
                title="Google Maps Showroom Location"
              ></iframe>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm"
          >
            <h2 className="text-3xl font-black mb-8 tracking-tight text-[#1d1d1f]">Direct Inquiry</h2>
            {success ? (
              <div className="bg-green-50 border border-green-100 p-8 rounded-[32px] text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-800">Message Dispatched!</h3>
                <p className="text-green-600 font-medium">Our EV specialists will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-widest">Full Name</label>
                    <input 
                      name="name"
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl py-4 px-6 focus:bg-white focus:border-primary outline-none transition-colors text-[#1d1d1f]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-widest">Phone Number</label>
                    <input 
                      name="phone"
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl py-4 px-6 focus:bg-white focus:border-primary outline-none transition-colors text-[#1d1d1f]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-widest">Your Email</label>
                  <input 
                    name="email"
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl py-4 px-6 focus:bg-white focus:border-primary outline-none transition-colors text-[#1d1d1f]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-widest">Service of Interest</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl py-4 px-6 focus:bg-white focus:border-primary outline-none transition-colors text-[#1d1d1f] appearance-none font-medium"
                  >
                    <option>Buy a New Bike</option>
                    <option>Book Service Appointment</option>
                    <option>Business Inquiry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1d1d1f] uppercase tracking-widest">Message</label>
                  <textarea 
                    name="message"
                    rows="5" 
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-[#f5f5f7] border border-transparent rounded-[32px] p-8 focus:bg-white focus:border-primary outline-none resize-none transition-colors text-[#1d1d1f]"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-5 text-xl font-black uppercase tracking-widest group disabled:opacity-50"
                >
                  <span className="flex items-center justify-center">
                    {loading ? 'DISPATCHING...' : 'DISPATCH MESSAGE'} 
                    <MessageCircle className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
