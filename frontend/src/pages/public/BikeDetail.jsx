import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { API_URL } from '../../services/api';
import { Battery, Zap, Timer, Award, Shield, CheckCircle, ArrowLeft, X, ChevronLeft, ChevronRight, Maximize2, Gauge, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../admin/components/Modal';

const BikeDetail = () => {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColorIndex]);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        const { data } = await api.get(`/bikes/${id}`);
        setBike(data);
      } catch (error) {
        console.error('Failed to fetch bike detail', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBike();
  }, [id]);

  const handleQuickBooking = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookingData = Object.fromEntries(formData.entries());

    try {
      await api.post('/bookings', { ...bookingData, bikeId: id });
      alert('Test ride requested! Track your status in the dashboard.');
      setIsBookingModalOpen(false);
    } catch (err) {
      alert('Failed to book. Please sign in first.');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '/placeholder-bike.png';
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!bike) return <div className="h-screen flex items-center justify-center">Bike not found.</div>;

  const hasColorVariants = bike.colorVariants && bike.colorVariants.length > 0;
  const currentImages = hasColorVariants
    ? (bike.colorVariants[selectedColorIndex]?.images || [])
    : (bike.images || []);
  const activeImage = currentImages[activeImageIndex] || bike.mainImage || '/placeholder-bike.png';

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/bikes" className="inline-flex items-center text-gray-500 hover:text-[#1d1d1f] mb-12 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Fleet
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Gallery & 360 View */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-video w-full bg-white rounded-[40px] overflow-hidden border border-gray-100 relative group flex items-center justify-center p-0 shadow-md">
              {bike.threeSixtyUrl && activeImageIndex === 0 && !hasColorVariants ? (
                <iframe
                  src={bike.threeSixtyUrl}
                  className="w-full h-full border-none"
                  title="360 View"
                />
              ) : (
                <div className="w-full h-full cursor-pointer flex items-center justify-center" onClick={() => setLightboxOpen(true)}>
                  <img src={getImageUrl(activeImage)} alt={bike.modelName} className="w-full h-full object-contain transition-transform duration-700 hover:scale-105 mix-blend-multiply" />
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 shadow-sm text-[#1d1d1f]">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              )}
              {bike.threeSixtyUrl && activeImageIndex === 0 && !hasColorVariants && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 text-[#1d1d1f] backdrop-blur-xl px-6 py-2 rounded-full border border-gray-200 text-xs font-bold uppercase tracking-widest shadow-sm">
                  360° Interactive View
                </div>
              )}
            </div>
            {currentImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {currentImages.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`aspect-square rounded-2xl overflow-hidden border transition-all cursor-pointer bg-white shadow-sm ${activeImageIndex === i ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <img src={getImageUrl(img)} alt={`View ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="mb-8">
              <span className="bg-[#f5f5f7] text-[#1d1d1f] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-200 mb-4 inline-block">
                {bike.brand}
              </span>
              <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tight text-[#1d1d1f]">{bike.modelName}</h1>
              <p className="text-3xl font-black text-primary">₹{Number(bike.price).toLocaleString()}</p>
            </div>

            {hasColorVariants && (
              <div className="mb-10">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Select Color</p>
                <div className="flex flex-wrap gap-3">
                  {bike.colorVariants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`px-6 py-2.5 rounded-full border text-xs font-bold transition-all uppercase tracking-widest ${selectedColorIndex === idx
                          ? 'border-primary bg-primary text-white shadow-md scale-105'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-[#1d1d1f]'
                        }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 mt-6">
              {[
                { icon: Battery, label: "Battery", value: bike.battery },
                { icon: Zap, label: "Range", value: bike.range },
                { icon: Timer, label: "Charging", value: bike.chargingTime },
                { icon: Gauge, label: "Top Speed", value: bike.topSpeed },
                { icon: Activity, label: "Power", value: bike.motorPower }
              ].filter(spec => spec.value).map((spec, i) => (
                <div key={i} className="flex flex-col items-start p-5 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="bg-[#f5f5f7] p-3 rounded-xl mb-3">
                    <spec.icon className="w-5 h-5 text-[#1d1d1f]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{spec.label}</p>
                    <p className="font-extrabold text-sm text-[#1d1d1f]">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {bike.customFeatures && bike.customFeatures.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold uppercase mb-6 tracking-tight text-[#1d1d1f]">Key Specifications & Features</h3>
                <div className="flex flex-col bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm">
                  {bike.customFeatures.map((feat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ delay: Math.min(i * 0.05, 0.5) }}
                      className="flex items-center justify-between p-6 border-b border-gray-100 last:border-0 hover:bg-[#f8f8fa] transition-colors"
                    >
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">{feat.name}</span>
                      {feat.value ? (
                        <span className="font-black text-sm sm:text-base text-[#1d1d1f] text-right ml-4">{feat.value}</span>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="flex-1 btn-primary py-5 text-xl flex justify-center uppercase font-black tracking-tighter"
              >
                Book Test Ride
              </button>
              <button
                onClick={() => navigate(`/compare?bike1=${id}`)}
                className="flex-1 btn-outline py-5 text-xl"
              >
                Compare Bike
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title={`Book Test Ride: ${bike?.modelName}`}>
        <form onSubmit={handleQuickBooking} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#1d1d1f] tracking-widest">Select Date</label>
              <input name="bookingDate" type="date" required className="w-full bg-white border border-gray-200 rounded-xl py-4 px-6 outline-none focus:border-primary shadow-sm text-[#1d1d1f]" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#1d1d1f] tracking-widest">Time Slot</label>
              <select name="timeSlot" className="w-full bg-white border border-gray-200 rounded-xl py-4 px-6 outline-none focus:border-primary font-bold shadow-sm text-[#1d1d1f]">
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center mt-4">
            * A valid driving license is required upon arrival.
          </p>
          <button type="submit" className="btn-primary w-full py-5 text-lg font-black uppercase tracking-widest">
            CONFIRM RESERVATION
          </button>
        </form>
      </Modal>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-4 bg-[#f5f5f7] rounded-full hover:bg-gray-200 hover:scale-110 transition-all z-10 shadow-sm"
            >
              <X className="w-6 h-6 text-[#1d1d1f]" />
            </button>

            {currentImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : currentImages.length - 1))}
                  className="absolute left-4 sm:left-10 p-4 bg-[#f5f5f7] rounded-full hover:bg-gray-200 transition-all hover:scale-110 border border-gray-200 z-10 shadow-sm"
                >
                  <ChevronLeft className="w-8 h-8 text-[#1d1d1f]" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < currentImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 sm:right-10 p-4 bg-[#f5f5f7] rounded-full hover:bg-gray-200 transition-all hover:scale-110 border border-gray-200 z-10 shadow-sm"
                >
                  <ChevronRight className="w-8 h-8 text-[#1d1d1f]" />
                </button>
              </>
            )}

            <motion.div
              key={activeImageIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-full max-w-7xl max-h-[85vh] flex items-center justify-center"
            >
              <img
                src={getImageUrl(activeImage)}
                alt={`${bike.modelName} zoom`}
                className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-2xl"
              />
            </motion.div>

            {currentImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-gray-200 text-[#1d1d1f] font-bold tracking-widest text-xs uppercase shadow-md">
                {activeImageIndex + 1} / {currentImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BikeDetail;
