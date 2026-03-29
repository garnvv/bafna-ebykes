import React, { useState, useEffect } from 'react';
import { Calendar, Bike, ChevronRight, XCircle, CheckCircle, Clock, Plus } from 'lucide-react';
import api, { API_URL } from '../../../services/api';
import Modal from '../../admin/components/Modal';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bikes, setBikes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const { data } = await api.get('/bikes');
      setBikes(data);
    } catch (err) {
      console.error('Failed to fetch bikes', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/mybookings');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this test ride?')) {
      try {
        await api.patch(`/bookings/${id}/cancel`);
        fetchBookings();
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };
  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    const bookingData = Object.fromEntries(formData.entries());

    try {
      await api.post('/bookings', bookingData);
      alert('Test ride requested! We will notify you once approved.');
      setIsModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request test ride');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Your Test Rides</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-2 px-4 text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>BOOK TEST RIDE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white shadow-sm border border-gray-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center group hover:border-primary/30 transition-all">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Bike className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase">{booking.Bike?.modelName}</h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 font-medium">
                   <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {booking.bookingDate}</span>
                   <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {booking.timeSlot}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-4 md:mt-0">
               <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                 booking.status === 'approved' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                 booking.status === 'pending' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                 'border-red-500/30 text-red-500 bg-red-500/10'
               }`}>
                 {booking.status}
               </span>
               {booking.status === 'pending' && (
                 <button 
                   onClick={() => handleCancel(booking.id)}
                   className="text-gray-500 hover:text-red-500 transition-colors"
                   title="Cancel Booking"
                 >
                   <XCircle className="w-5 h-5" />
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && !loading && (
        <div className="py-20 text-center bg-[#f5f5f7] rounded-3xl border border-dashed border-gray-200">
           <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
           <p className="text-gray-500">No active test rides. Visit the showroom to book one!</p>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request a Test Ride">
        <form onSubmit={handleBooking} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Select Model</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {bikes.map(bike => (
                <label key={bike.id} className="relative group cursor-pointer">
                  <input type="radio" name="bikeId" value={bike.id} required className="peer sr-only" />
                  <div className="p-4 bg-[#f5f5f7] border-2 border-transparent peer-checked:border-primary peer-checked:bg-white rounded-2xl transition-all flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <img 
                        src={
                          bike.mainImage ? (bike.mainImage.startsWith('http') ? bike.mainImage : `${API_URL}${bike.mainImage}`)
                            : (bike.images && bike.images.length > 0) ? (bike.images[0].startsWith('http') ? bike.images[0] : `${API_URL}${bike.images[0]}`)
                              : (bike.colorVariants && bike.colorVariants.length > 0 && bike.colorVariants[0].images && bike.colorVariants[0].images.length > 0) ? (bike.colorVariants[0].images[0].startsWith('http') ? bike.colorVariants[0].images[0] : `${API_URL}${bike.colorVariants[0].images[0]}`)
                                : '/placeholder-bike.png'
                        } 
                        className="w-full h-full object-contain"
                        alt={bike.modelName}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{bike.modelName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{bike.brand}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Preferred Date</label>
              <input name="bookingDate" type="date" required className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Time Slot</label>
              <select name="timeSlot" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary font-bold">
                <option value="Morning (10AM - 1PM)">Morning</option>
                <option value="Afternoon (2PM - 5PM)">Afternoon</option>
                <option value="Evening (5PM - 8PM)">Evening</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Optional Notes</label>
             <textarea name="notes" rows="2" placeholder="Tell us anything else..." className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary resize-none" />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-4 font-black uppercase tracking-widest disabled:opacity-50">
            {submitting ? 'SENDING REQUEST...' : 'CONFIRM REQUEST'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BookingManager;
