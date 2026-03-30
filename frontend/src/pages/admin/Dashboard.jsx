import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, Bike, Calendar, Wrench, MessageSquare, Star, 
  TrendingUp, Activity, LayoutDashboard, Settings, Bell, ChevronRight, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Sub-components
import BikeManager from './components/BikeManager';
import BookingManager from './components/BookingManager';
import MessageManager from './components/MessageManager';
import UserManager from './components/UserManager';
import StockManager from './components/StockManager';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggerOnboard, setTriggerOnboard] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') fetchAnalytics();
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl transition-all ${
        activeTab === id ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );

  return (
    <div className="pt-24 min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-[#f8f8fa] border-r border-gray-200 p-6 space-y-2 flex-shrink-0">
        <div className="px-4 py-8 mb-4">
          <div className="bg-[#f5f5f7] border border-gray-200 p-4 rounded-2xl shadow-sm">
             <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Command Center</p>
             <p className="text-[#1d1d1f] font-bold flex items-center">
               <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" /> Operational
             </p>
          </div>
        </div>
        <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
        <SidebarItem id="bikes" icon={Bike} label="Fleet Management" />
        <SidebarItem id="bookings" icon={Calendar} label="Test Rides" />
        <SidebarItem id="services" icon={Wrench} label="Service Requests" />
        <SidebarItem id="messages" icon={MessageSquare} label="Inquiries" />
        <SidebarItem id="feedback" icon={Star} label="Reviews" />
        <SidebarItem id="users" icon={Users} label="Customers" />
        <SidebarItem id="stock" icon={Package} label="Stock / Inventory" />
        <div className="pt-10 border-t border-gray-200 mt-10">
          <SidebarItem id="settings" icon={Settings} label="System Config" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && analytics && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
              <div className="flex justify-between items-end">
                 <div>
                    <h1 className="text-4xl font-black uppercase text-[#1d1d1f] tracking-tight">Analytics Engine</h1>
                    <p className="text-gray-500">Total control over your showroom performance.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Fleet size", value: analytics?.summary?.totalBikes ?? 0, icon: Bike, color: "text-primary" },
                  { label: "Registered Users", value: analytics?.summary?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
                  { label: "Active Bookings", value: analytics?.summary?.totalBookings ?? 0, icon: Calendar, color: "text-green-400" },
                  { label: "Service Queue", value: analytics?.summary?.totalServices ?? 0, icon: Wrench, color: "text-orange-400" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm relative overflow-hidden group">
                    <stat.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] ${stat.color} transition-transform group-hover:scale-110`} />
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                    <p className="text-5xl font-black text-[#1d1d1f]">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Onboard Customer', desc: 'Add a new user & vehicle', icon: Users, color: 'from-blue-500/20', action: () => { setActiveTab('users'); setTriggerOnboard(true); } },
                  { label: 'Add Bike', desc: 'List a new electric model', icon: Bike, color: 'from-primary/20', tab: 'bikes' },
                  { label: 'View Bookings', desc: 'Manage test ride queue', icon: Calendar, color: 'from-orange-500/20', tab: 'bookings' },
                  { label: 'View Messages', desc: 'Customer inquiries', icon: MessageSquare, color: 'from-purple-500/20', tab: 'messages' },
                ].map((action, i) => (
                  <button key={i} onClick={() => action.action ? action.action() : setActiveTab(action.tab)}
                    className={`p-6 rounded-3xl border border-gray-100 bg-[#f5f5f7] hover:bg-white text-left hover:border-gray-300 hover:shadow-md transition-all group`}>
                    <action.icon className="w-8 h-8 mb-4 text-[#1d1d1f] transition-all" />
                    <p className="font-extrabold text-sm uppercase tracking-tight text-[#1d1d1f]">{action.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{action.desc}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-10 uppercase flex items-center text-[#1d1d1f]">
                    <TrendingUp className="w-6 h-6 mr-3 text-primary" /> Booking Velocity
                  </h3>
                  <div className="h-72">
                    {analytics?.chartData ? (
                      <Line 
                        data={{
                          labels: analytics.chartData.map(d => d.month),
                          datasets: [{
                            label: 'Bookings',
                            data: analytics.chartData.map(d => d.count),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 4,
                            pointRadius: 6,
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { 
                            y: { beginAtZero: true, border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' } },
                            x: { border: { display: false }, grid: { display: false } }
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 italic">No chart data available</div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-10 uppercase flex items-center text-[#1d1d1f]">
                     <Activity className="w-6 h-6 mr-3 text-primary" /> Live Traffic
                  </h3>
                  <div className="space-y-4">
                    {analytics?.recentBookings?.length > 0 ? (
                      analytics.recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-5 bg-[#f5f5f7] rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#1d1d1f] font-bold shadow-sm">
                              {booking.User?.name?.[0] || 'G'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#1d1d1f]">{booking.User?.name || 'Guest'}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{booking.Bike?.modelName || 'Test Ride'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded font-bold text-gray-500 uppercase tracking-widest shadow-sm">
                               {booking.status}
                             </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-gray-400 italic">No recent activity</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bikes' && (
            <motion.div key="bikes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <h2 className="text-3xl font-black uppercase text-[#1d1d1f]">Fleet Manager</h2>
                <p className="text-gray-500">Control your inventory, prices, and specifications.</p>
              </div>
              <BikeManager />
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <h2 className="text-3xl font-black uppercase text-[#1d1d1f]">Test Ride Queue</h2>
                <p className="text-gray-500">Manage demonstration appointments and approvals.</p>
              </div>
              <BookingManager type="testrides" />
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <h2 className="text-3xl font-black uppercase text-[#1d1d1f]">Service Bay</h2>
                <p className="text-gray-500">Track maintenance cycles and repair requests.</p>
              </div>
              <BookingManager type="services" />
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <h2 className="text-3xl font-black uppercase text-[#1d1d1f]">Customer Inbox</h2>
                <p className="text-gray-500">Respond to public inquiries and contact forms.</p>
              </div>
              <MessageManager type="messages" />
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div key="feedback" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <h2 className="text-3xl font-black uppercase text-[#1d1d1f]">Fleet Reviews</h2>
                <p className="text-gray-500">Monitor customer satisfaction and performance ratings.</p>
              </div>
              <MessageManager type="feedback" />
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div className="mb-10">
                 <h2 className="text-3xl font-black uppercase text-[#1d1d1f]">Customer Registry</h2>
                 <p className="text-gray-500">Manage user profiles and send reminders.</p>
               </div>
               <UserManager triggerOnboard={triggerOnboard} onTriggerHandled={() => setTriggerOnboard(false)} />
            </motion.div>
          )}

          {activeTab === 'stock' && (
            <motion.div key="stock" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-10">
                <h2 className="text-3xl font-black uppercase text-[#1d1d1f]">Stock & Inventory</h2>
                <p className="text-gray-500">Manage spare parts, sell items, generate bills, and track profits.</p>
              </div>
              <StockManager />
            </motion.div>
          )}

          {activeTab === 'settings' && (
             <div className="h-[60vh] flex flex-col items-center justify-center text-center text-gray-500">
               <Settings className="w-16 h-16 mb-4 opacity-10 text-[#1d1d1f]" />
               <h2 className="text-xl font-bold text-[#1d1d1f] uppercase">System Configuration</h2>
               <p>Global showroom settings are managed in your env config.</p>
             </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
