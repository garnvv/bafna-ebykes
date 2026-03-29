import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { API_URL } from '../../services/api';
import {
  LayoutDashboard, Calendar, Wrench, Award, User, Bell,
  ChevronRight, Clock, Star, MapPin, MessageSquare, Bike,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import BookingManager from './components/BookingManager';
import ServiceManager from './components/ServiceManager';
import FeedbackForm from './components/FeedbackForm';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ bookings: 0, services: 0, vehicles: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ Fix: correctly destructure all 3 responses
        const [bookingsRes, servicesRes, vehiclesRes] = await Promise.all([
          api.get('/bookings/mybookings'),
          api.get('/services/myservices'),
          api.get('/user/myvehicles')
        ]);

        setStats({
          bookings: bookingsRes.data?.length || 0,
          services: servicesRes.data?.length || 0,
          vehicles: vehiclesRes.data?.length || 0
        });
        setRecentBookings(bookingsRes.data?.slice(0, 3) || []);
        setMyVehicles(vehiclesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl transition-all ${activeTab === id ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  // Helper: days until next service
  const daysUntilService = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="pt-24 min-h-screen bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-2">
            <div className="px-6 py-8 mb-4 bg-white shadow-sm border border-gray-100 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-black text-primary mb-4 border border-primary/20">
                {user?.name?.[0]}
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight">{user?.name}</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{user?.email}</p>
              {user?.customerId && (
                <p className="text-xs font-mono text-primary/70 mt-2 bg-primary/5 px-2 py-1 rounded-lg">{user.customerId}</p>
              )}
            </div>
            <SidebarItem id="overview" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem id="garage" icon={Bike} label="My Garage" />
            <SidebarItem id="bookings" icon={Calendar} label="Test Rides" />
            <SidebarItem id="services" icon={Wrench} label="Service Hub" />
            <SidebarItem id="feedback" icon={Star} label="Feedback" />
            <SidebarItem id="profile" icon={User} label="Profile" />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ─────────────────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h1 className="text-4xl font-black uppercase italic tracking-tighter">bafna Cockpit</h1>
                      <p className="text-gray-500">Total control over your electric fleet.</p>
                    </div>
                    <div className="bg-white shadow-sm px-6 py-4 rounded-2xl border border-gray-200 flex items-center space-x-4">
                      <MapPin className="text-primary w-5 h-5" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Showroom</p>
                        <p className="text-sm font-bold">Pune City Center</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-bold">
                    {[
                      { label: "My Garage", value: stats.vehicles, icon: Bike, color: "text-green-500", tab: 'garage' },
                      { label: "Test Rides", value: stats.bookings, icon: Calendar, color: "text-blue-400", tab: 'bookings' },
                      { label: "Services", value: stats.services, icon: Wrench, color: "text-orange-400", tab: 'services' }
                    ].map((stat, i) => (
                      <button key={i} onClick={() => setActiveTab(stat.tab)}
                        className="bg-white shadow-sm p-8 rounded-[32px] border border-gray-200 group hover:border-primary/30 transition-all text-left">
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-6 transition-transform group-hover:scale-110`} />
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-4xl font-black">{stat.value}</p>
                      </button>
                    ))}
                  </div>

                  {/* My Garage Preview */}
                  <div className="bg-white shadow-sm p-10 rounded-[40px] border border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold uppercase flex items-center tracking-tight">
                        <Bike className="w-5 h-5 mr-3 text-primary" /> My Garage
                      </h3>
                      <button onClick={() => setActiveTab('garage')} className="text-xs text-primary font-black uppercase tracking-widest flex items-center">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                    {loadingVehicles ? (
                      <p className="text-gray-500 italic py-8 text-center">Loading vehicles...</p>
                    ) : myVehicles.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-500">
                        <Bike className="w-10 h-10 mx-auto mb-4 opacity-30" />
                        <p>No vehicles registered yet. Contact the showroom.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myVehicles.slice(0, 2).map(v => (
                          <VehicleCard key={v.id} vehicle={v} daysUntilService={daysUntilService} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Bookings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white shadow-sm p-10 rounded-[40px] border border-gray-200">
                      <h3 className="text-xl font-bold mb-8 uppercase flex items-center tracking-tight">
                        <Clock className="w-5 h-5 mr-3 text-primary" /> Recent Test Rides
                      </h3>
                      <div className="space-y-6">
                        {recentBookings.map(booking => (
                          <div key={booking.id} className="flex justify-between items-center p-6 bg-[#f5f5f7] rounded-3xl border border-gray-100 group">
                            <div className="flex items-center space-x-6">
                              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                                {booking.Bike?.modelName?.[0] || 'B'}
                              </div>
                              <div>
                                <p className="font-bold">{booking.Bike?.modelName}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{booking.bookingDate}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                          </div>
                        ))}
                        {recentBookings.length === 0 && <p className="text-gray-500 italic">No test rides booked yet.</p>}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ── MY GARAGE ───────────────────────────────── */}
              {activeTab === 'garage' && (
                <motion.div key="garage" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">My Garage</h2>
                    <p className="text-gray-500 mt-1">Your registered electric vehicles and service schedule.</p>
                  </div>
                  {loadingVehicles ? (
                    <p className="text-gray-500 text-center py-20 italic">Fetching your vehicles...</p>
                  ) : myVehicles.length === 0 ? (
                    <div className="py-32 text-center border-2 border-dashed border-gray-200 rounded-[40px]">
                      <Bike className="w-16 h-16 mx-auto text-gray-700 mb-6" />
                      <h3 className="text-xl font-bold text-gray-500">No Registered Vehicles</h3>
                      <p className="text-gray-600 mt-2 text-sm">Visit the showroom and ask admin to register your bike.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {myVehicles.map(v => (
                        <VehicleCard key={v.id} vehicle={v} daysUntilService={daysUntilService} expanded />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── TEST RIDES ──────────────────────────────── */}
              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <BookingManager />
                </motion.div>
              )}

              {/* ── SERVICE HUB ─────────────────────────────── */}
              {activeTab === 'services' && (
                <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <ServiceManager />
                </motion.div>
              )}


              {activeTab === 'feedback' && (
                <motion.div key="feedback" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="max-w-2xl mx-auto">
                    <FeedbackForm type="showroom" onComplete={() => setActiveTab('overview')} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white shadow-sm p-12 rounded-[40px] border border-gray-200">
                    <div className="text-center mb-10">
                      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl font-black text-primary mx-auto mb-6">
                        {user?.name?.[0]}
                      </div>
                      <h2 className="text-3xl font-black uppercase mb-2">{user?.name}</h2>
                      <p className="text-gray-500 text-lg">{user?.email}</p>
                      {user?.customerId && (
                        <p className="text-xs font-mono text-primary mt-2 bg-primary/5 inline-block px-4 py-2 rounded-xl border border-primary/20">{user.customerId}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-center">
                      <div className="bg-[#f5f5f7] rounded-2xl p-6 border border-gray-200">
                        <p className="text-2xl font-black text-primary">{stats.vehicles}</p>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold">Vehicles</p>
                      </div>
                      <div className="bg-[#f5f5f7] rounded-2xl p-6 border border-gray-200">
                        <p className="text-2xl font-black text-blue-400">{stats.bookings}</p>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold">Test Rides</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

// ── VEHICLE CARD COMPONENT ────────────────────────────────────────────────────
const VehicleCard = ({ vehicle: v, daysUntilService, expanded = false }) => {
  const days = daysUntilService(v.nextServiceDate);
  const serviceUrgent = days !== null && days <= 15;
  const serviceSoon = days !== null && days > 15 && days <= 45;

  return (
    <div className="p-8 bg-[#f5f5f7] rounded-[32px] border border-gray-100 hover:border-primary/20 transition-all">
      <div className="flex items-start space-x-6">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 bg-white p-2">
          <img
            src={
              v.Bike?.mainImage ? (v.Bike.mainImage.startsWith('http') ? v.Bike.mainImage : `${API_URL}${v.Bike.mainImage}`)
                : (v.Bike?.images && v.Bike.images.length > 0) ? (v.Bike.images[0].startsWith('http') ? v.Bike.images[0] : `${API_URL}${v.Bike.images[0]}`)
                  : (v.Bike?.colorVariants && v.Bike.colorVariants.length > 0 && v.Bike.colorVariants[0].images && v.Bike.colorVariants[0].images.length > 0) ? (v.Bike.colorVariants[0].images[0].startsWith('http') ? v.Bike.colorVariants[0].images[0] : `${API_URL}${v.Bike.colorVariants[0].images[0]}`)
                    : '/placeholder-bike.png'
            }
            alt={v.Bike?.modelName}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">{v.Bike?.brand}</p>
          <h4 className="text-xl font-black mt-1">{v.Bike?.modelName}</h4>
          {v.color && <p className="text-xs text-gray-500 mt-1">Color: {v.color}</p>}
        </div>
      </div>

      {expanded && (
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <InfoRow label="Vehicle Reg ID" value={v.vehicleRegId} mono highlight />
          <InfoRow label="VIN / Chassis" value={v.vin} mono />
          <InfoRow label="Purchased" value={v.purchaseDate} />
          {v.color && <InfoRow label="Color" value={v.color} />}
        </div>
      )}

      {/* Service Status */}
      {v.nextServiceDate && (
        <div className={`mt-6 flex items-center space-x-3 px-4 py-3 rounded-xl border ${serviceUrgent ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          serviceSoon ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
            'bg-green-500/10 border-green-500/30 text-green-400'
          }`}>
          {serviceUrgent ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <ShieldCheck className="w-4 h-4 flex-shrink-0" />}
          <div>
            <p className="text-xs font-black uppercase tracking-widest">
              {serviceUrgent ? 'Service Overdue / Due Soon!' :
                serviceSoon ? 'Service Coming Up' : 'Next Service'}
            </p>
            <p className="text-sm font-bold mt-0.5">
              {v.nextServiceDate} {days !== null && `(${days > 0 ? `in ${days} days` : 'Today!'})`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, mono = false, highlight = false }) => (
  <div className="bg-[#f5f5f7] rounded-xl p-3">
    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
    <p className={`text-sm font-bold mt-1 ${mono ? 'font-mono' : ''} ${highlight ? 'text-primary' : ''}`}>{value || '—'}</p>
  </div>
);

export default CustomerDashboard;
