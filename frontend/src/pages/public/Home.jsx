import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Battery, Navigation } from 'lucide-react';
import api, { API_URL } from '../../services/api';
import { motion } from 'framer-motion';

const Home = () => {
  const [featuredBikes, setFeaturedBikes] = useState([]);

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const { data } = await api.get('/bikes');
        setFeaturedBikes(data.filter(bike => bike.isFeatured).slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch bikes', error);
      }
    };
    fetchBikes();
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#f5f5f7] to-white pt-20">
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold tracking-widest uppercase mb-4 block text-sm">Next Generation Mobility</span>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight text-[#1d1d1f]">
              Ride Smarter. <br />
              <span className="text-primary">Ride Electric.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Experience the pure elegance of electric engineering. Silent, powerful, and impeccably designed for the modern world.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/bikes" className="btn-primary py-4 px-10 text-lg flex items-center justify-center w-full sm:w-auto hover:scale-105 transition-transform">
                Explore Bikes
              </Link>
              <Link to="/dashboard" className="btn-outline py-4 px-10 text-lg flex items-center justify-center w-full sm:w-auto">
                Book Test Ride
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1d1d1f]">Why Choose Our E-Bikes.</h2>
             <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">Masterfully crafted for maximum performance with zero emissions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Instant Torque", desc: "Push-button acceleration that leaves traffic behind." },
              { icon: Battery, title: "Long Range", desc: "Up to 120km on a single charge for worry-free rides." },
              { icon: Shield, title: "Smart Technology", desc: "Integrated digital tracking and seamless mobile control." },
              { icon: Navigation, title: "Eco-Friendly", desc: "Zero emissions power train for a fully sustainable future." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-[#f5f5f7] border border-transparent hover:border-gray-200 transition-all group flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#1d1d1f] tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bikes */}
      <section className="py-32 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-[#1d1d1f]">Featured Lineup.</h2>
              <p className="text-gray-500 text-xl">Our best-selling electric machines, built for performance.</p>
            </div>
            <Link to="/bikes" className="text-primary hover:text-primary-dark font-semibold flex items-center mt-4 md:mt-0 transition-colors">
              View All <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredBikes.map((bike, i) => (
              <motion.div
                key={bike.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="card group bg-white border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all p-2 rounded-[32px]"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-white flex items-center justify-center p-0">
                  <img
                    src={
                      (bike.images && bike.images.length > 0) ? (bike.images[0].startsWith('http') ? bike.images[0] : `${API_URL}${bike.images[0]}`)
                        : (bike.colorVariants && bike.colorVariants.length > 0 && bike.colorVariants[0].images && bike.colorVariants[0].images.length > 0) ? (bike.colorVariants[0].images[0].startsWith('http') ? bike.colorVariants[0].images[0] : `${API_URL}${bike.colorVariants[0].images[0]}`)
                          : '/placeholder-bike.png'
                    }
                    alt={bike.modelName}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#1d1d1f] font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-sm border border-gray-100">
                    New
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{bike.modelName}</h3>
                    <p className="text-primary font-black text-xl">₹{Number(bike.price).toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-[#f5f5f7] rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Range</p>
                      <p className="font-bold text-sm text-[#1d1d1f]">{bike.range}</p>
                    </div>
                    <div className="text-center p-3 bg-[#f5f5f7] rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Charge</p>
                      <p className="font-bold text-sm text-[#1d1d1f]">{bike.chargingTime}</p>
                    </div>
                    <div className="text-center p-3 bg-[#f5f5f7] rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Battery</p>
                      <p className="font-bold text-sm truncate text-[#1d1d1f]">{bike.battery}</p>
                    </div>
                  </div>
                  
                  {bike.customFeatures && bike.customFeatures.filter(f => f.value).slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-center text-sm font-medium text-gray-500 mb-2 px-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3"></div>
                       <span><span className="text-[#1d1d1f] font-bold">{feat.name}:</span> {feat.value}</span>
                    </div>
                  ))}
                  
                  <div className="mb-6"></div>
                  <Link to={`/bikes/${bike.id}`} className="block w-full py-3.5 bg-[#f5f5f7] hover:bg-[#1d1d1f] hover:text-white text-[#1d1d1f] text-center font-bold rounded-xl transition-all">
                    View Specs
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[40px] bg-[#f5f5f7] py-24 px-8 text-center border border-gray-100 shadow-sm relative overflow-hidden">
            <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight text-[#1d1d1f] relative z-10">Experience the Future of Riding.</h2>
            <p className="text-xl font-medium mb-12 max-w-xl mx-auto text-gray-500 relative z-10">
              Book a complimentary test ride today. Feel the engineering perfectly tuned to the modern road.
            </p>
            <div className="flex justify-center relative z-10">
              <Link to="/dashboard" className="btn-primary py-4 px-12 text-lg">
                Book Your Test Ride
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-10 right-10 z-50 bg-[#25D366] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Questions? Chat with us!
        </span>
      </a>
    </div>
  );
};

export default Home;
