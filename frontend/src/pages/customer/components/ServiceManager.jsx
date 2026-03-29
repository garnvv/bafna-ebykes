import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Plus, Clock, AlertCircle, Download, Send } from 'lucide-react';
import api, { API_URL } from '../../../services/api';
import Modal from '../../admin/components/Modal';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myVehicles, setMyVehicles] = useState([]);

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/user/myvehicles');
      setMyVehicles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await api.get('/services/myservices');
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const serviceData = Object.fromEntries(formData.entries());

    try {
      await api.post('/services', serviceData);
      alert('Service appointment requested!');
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      alert('Failed to book appointment');
    }
  };

  const handleDownloadBill = async (id) => {
    try {
      const response = await api.get(`/services/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Maintenance Hub</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-2 px-4 text-xs flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>REQUEST SERVICE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white shadow-sm border border-gray-200 rounded-3xl p-8 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${service.status === 'completed' ? 'text-green-500' : 'text-primary'}`}>
              <Wrench className="w-16 h-16" />
            </div>
            
            <div className="relative z-10 space-y-4">
               <div>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-[#f5f5f7] px-2 py-1 rounded text-primary mb-2 inline-block">
                    {service.serviceType} Service
                  </span>
                  <h3 className="text-lg font-bold">Appointment on {service.appointmentDate}</h3>
               </div>
               
               <div className="flex items-center space-x-3 text-xs text-gray-500 font-bold uppercase">
                  <span className={`px-2 py-1 rounded ${
                    service.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                    service.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {service.status}
                  </span>
                  {service.cost > 0 && <span className="text-[#1d1d1f]">Estimated: ₹{service.cost}</span>}
               </div>

               {service.description && (
                 <p className="text-sm text-gray-500 italic">"{service.description}"</p>
               )}

               {service.status === 'completed' && (
                  <button 
                    onClick={() => handleDownloadBill(service.id)}
                    className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 pt-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Bill</span>
                  </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="py-20 text-center bg-[#f5f5f7] rounded-3xl border border-dashed border-gray-200">
           <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
           <p className="text-gray-500">Your vehicle history is clean. Book your first check-up!</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Maintenance">
         <form onSubmit={handleBooking} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Select Your Vehicle</label>
              <select name="vehicleId" required className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-4 px-6 outline-none focus:border-primary font-bold">
                 <option value="" className="bg-white text-gray-500">Choose Vehicle...</option>
                 {myVehicles.map(v => (
                   <option key={v.id} value={v.vin} className="bg-white text-[#1d1d1f]">
                     {v.Bike?.modelName} ({v.vin})
                   </option>
                 ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Service Type</label>
              <select name="serviceType" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-4 px-6 outline-none focus:border-primary">
                 <option value="normal" className="bg-white">Normal Service</option>
                 <option value="repair" className="bg-white">Repair / Fix</option>
                 <option value="battery" className="bg-white">Battery Check</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Preferred Date</label>
                 <input name="appointmentDate" type="date" required className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-4 px-6 outline-none focus:border-primary" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Time Slot</label>
                 <select name="timeSlot" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-4 px-6 outline-none focus:border-primary font-bold">
                    <option value="Morning (10AM - 1PM)" className="bg-white">Morning</option>
                    <option value="Afternoon (2PM - 5PM)" className="bg-white">Afternoon</option>
                    <option value="Evening (5PM - 8PM)" className="bg-white">Evening</option>
                 </select>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Remarks / Complaints</label>
               <textarea name="description" rows="3" placeholder="Describe any issues with your machine..." className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-6 outline-none focus:border-primary resize-none" />
            </div>

            <button type="submit" className="btn-primary w-full py-4 font-black uppercase tracking-widest">
               CONFIRM APPOINTMENT
            </button>
         </form>
      </Modal>
    </div>
  );
};

export default ServiceManager;
