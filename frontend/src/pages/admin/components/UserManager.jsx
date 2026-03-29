import React, { useState, useEffect } from 'react';
import { Users, Search, Bell, History, ArrowRight, Bike, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import Modal from './Modal';

const UserManager = ({ triggerOnboard, onTriggerHandled }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [reminderMsg, setReminderMsg] = useState('');
  const [reminderWaUrl, setReminderWaUrl] = useState(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [history, setHistory] = useState({ bookings: [], services: [], vehicles: [] });
  const [bikes, setBikes] = useState([]);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState(null);
  const [onboardData, setOnboardData] = useState({
    name: '', email: '', password: '', phone: '', whatsapp: '', address: '',
    bikeId: '', vin: '', color: '', purchaseDate: new Date().toISOString().substr(0, 10),
    nextServiceDate: '', serviceIntervalDays: '90', notes: '', vehicleCategory: ''
  });
  const [editUser, setEditUser] = useState(null);
  const [editData, setEditData] = useState({ name: '', phone: '', whatsapp: '', address: '', vehicleCategory: '' });

  // Auto-open onboard modal when triggered from the Dashboard overview quick-action
  useEffect(() => {
    if (triggerOnboard) {
      setIsOnboardModalOpen(true);
      if (onTriggerHandled) onTriggerHandled();
    }
  }, [triggerOnboard]);

  useEffect(() => {
    fetchUsers();
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const { data } = await api.get('/bikes');
      setBikes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      console.log('Admin Users List:', data);
      setUsers(data);
    } catch (err) {
      console.error('Fetch Users Error:', err);
      // Don't alert - just log so the tab loads even if empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser) fetchHistory(selectedUser.id);
  }, [selectedUser]);

  const fetchHistory = async (userId) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}/history`);
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/reminders', { userId: selectedUser.id, message: reminderMsg });
      setReminderWaUrl(data.waUrl || null);
      if (!data.waUrl) alert('Reminder sent via email!');
    } catch (err) {
      alert('Failed to send reminder: ' + (err.response?.data?.message || err.message));
    }
  };

  const closeReminderModal = () => {
    setSelectedUser(null);
    setReminderMsg('');
    setReminderWaUrl(null);
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    try {
      await api.post('/admin/broadcast', { message: broadcastMsg });
      alert('Broadcast dispatched to all users!');
      setIsBroadcastModalOpen(false);
      setBroadcastMsg('');
    } catch (err) {
      alert('Failed to send broadcast');
    }
  };

  const handleOnboardCustomer = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/onboard-customer', onboardData);
      setOnboardSuccess(data);
      fetchUsers();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const closeOnboardModal = () => {
    setIsOnboardModalOpen(false);
    setOnboardSuccess(null);
    setOnboardData({
      name: '', email: '', password: '', phone: '', whatsapp: '', address: '',
      bikeId: '', vin: '', color: '', purchaseDate: new Date().toISOString().substr(0, 10),
      nextServiceDate: '', serviceIntervalDays: '90', notes: '', vehicleCategory: ''
    });
  };

  const set = (field) => (e) => setOnboardData(prev => ({ ...prev, [field]: e.target.value }));

  const openEditModal = (u) => {
    setEditUser(u);
    setEditData({ name: u.name, phone: u.phone || '', whatsapp: u.whatsapp || '', address: u.address || '', vehicleCategory: u.vehicleCategory || '' });
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/customers/${editUser.id}`, editData);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCustomer = async (u) => {
    if (!window.confirm(`Delete customer "${u.name}"? This will also remove all their registered vehicles. This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/customers/${u.id}`);
      fetchUsers();
      if (selectedUser?.id === u.id) setSelectedUser(null);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 pl-12 pr-6 outline-none focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsBroadcastModalOpen(true)}
          className="btn-outline py-3 px-6 flex items-center space-x-2 font-black"
        >
          <Bell className="w-5 h-5" />
          <span>BROADCAST</span>
        </button>
        <button
          onClick={() => setIsOnboardModalOpen(true)}
          className="btn-primary py-3 px-6 flex items-center space-x-2 font-black"
        >
          <Plus className="w-5 h-5" />
          <span>ONBOARD CUSTOMER</span>
        </button>
      </div>

      {/* ── SALES BY DATE ANALYTICS ─────────────────────────────── */}
      <SalesByDate />

      {/* ── CUSTOMER LIST TABLE ─────────────────────────────────── */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left bg-[#f8f8fa]">
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-widest rounded-tl-xl">Customer</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-widest hidden md:table-cell">Customer ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-widest hidden lg:table-cell">Phone</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-widest hidden lg:table-cell">Joined</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-widest text-right rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u =>
              u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (u.customerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (u.phone || '').includes(searchTerm)
            ).map((user, i) => (
              <tr key={user.id} className={`border-b border-gray-100 hover:bg-[#f5f5f7] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#f8f8fa]'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border border-primary/20 flex-shrink-0">
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="font-mono text-xs text-primary/80">{user.customerId || '—'}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">{user.phone || '—'}</td>
                <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => openEditModal(user)} title="Edit" className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-all"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteCustomer(user)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => setSelectedUser(user)} title="Manage" className="p-2 rounded-lg hover:bg-gray-100 text-[#1d1d1f] transition-all"><ArrowRight className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="italic">No customers yet. Click "Onboard Customer" to add the first one.</p>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Manage ${selectedUser?.name}`}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#f5f5f7] rounded-2xl border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-500 tracking-widest mb-2">Phone Number</p>
              <p className="text-lg font-bold">{selectedUser?.phone || 'Not provided'}</p>
            </div>
            <div className="p-6 bg-[#f5f5f7] rounded-2xl border border-gray-100">
              <p className="text-xs font-black uppercase text-gray-500 tracking-widest mb-2">Account Role</p>
              <p className="text-lg font-bold uppercase">{selectedUser?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
              <Bell className="w-4 h-4 mr-2" /> Send Direct Reminder
            </h4>

            {reminderWaUrl ? (
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
                  <p className="text-green-400 font-black text-sm uppercase tracking-widest">✅ Reminder Sent!</p>
                  <p className="text-gray-500 text-xs mt-1">Email dispatched • Open WhatsApp to send message</p>
                </div>
                <a href={reminderWaUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-500 transition-colors py-3 rounded-xl font-black uppercase tracking-widest text-center text-sm flex items-center justify-center space-x-2">
                  <span>💬</span><span>OPEN WHATSAPP & SEND</span>
                </a>
                <button onClick={closeReminderModal} className="btn-outline w-full py-3 font-black uppercase text-sm">DONE</button>
              </div>
            ) : (
              <>
                <div className="bg-[#f5f5f7] border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 flex items-center space-x-3">
                  <span>📧</span>
                  <span>Sends to <span className="text-[#1d1d1f] font-bold">{selectedUser?.email}</span>
                    {(selectedUser?.whatsapp || selectedUser?.phone) && <span className="text-green-400 font-bold"> + 💬 WhatsApp</span>}
                  </span>
                </div>
                <textarea
                  rows="3"
                  placeholder="Type reminder message... (e.g. Your service is due on 25 March)"
                  className="w-full bg-[#f5f5f7] border border-gray-200 rounded-2xl p-6 outline-none focus:border-primary resize-none"
                  value={reminderMsg}
                  onChange={(e) => setReminderMsg(e.target.value)}
                />
                <button
                  onClick={handleSendReminder}
                  disabled={!reminderMsg.trim()}
                  className="btn-primary w-full py-4 font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  DISPATCH REMINDER
                </button>
              </>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center">
              <History className="w-4 h-4 mr-2" /> Comprehensive History
            </h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {history.bookings.map(b => (
                <div key={`b-${b.id}`} className="p-4 bg-[#f5f5f7] rounded-xl border border-gray-100 flex justify-between">
                  <div>
                    <p className="text-xs font-bold">{b.Bike?.modelName} Test Ride</p>
                    <p className="text-[10px] text-gray-500 uppercase">{b.bookingDate}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-400">{b.status}</span>
                </div>
              ))}
              {history.services.map(s => (
                <div key={`s-${s.id}`} className="p-4 bg-[#f5f5f7] rounded-xl border border-gray-100 flex justify-between">
                  <div>
                    <p className="text-xs font-bold">{s.serviceType} Service</p>
                    <p className="text-[10px] text-gray-500 uppercase">{s.appointmentDate}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-orange-400">{s.status}</span>
                </div>
              ))}
              {!history.bookings.length && !history.services.length && (
                <p className="text-center text-gray-500 italic py-10 text-sm">No activity records found.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── UNIFIED ONBOARD CUSTOMER MODAL ──────────────────────── */}
      <Modal isOpen={isOnboardModalOpen} onClose={closeOnboardModal} title="Onboard New Customer + Vehicle">

        {onboardSuccess ? (
          /* SUCCESS STATE */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto border-2 border-primary">
              <span className="text-3xl">✅</span>
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase text-primary">Customer Onboarded!</h3>
              <p className="text-gray-500 text-sm mt-1">Share these IDs with the customer.</p>
            </div>

            <div className="bg-[#f5f5f7] border border-gray-200 rounded-2xl p-6 space-y-4 text-left shadow-sm">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Customer Name</p>
                <p className="text-xl font-bold mt-1">{onboardSuccess.customer?.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Customer ID</p>
                <p className="text-lg font-black text-primary font-mono mt-1">{onboardSuccess.customer?.customerId}</p>
              </div>
              {onboardSuccess.vehicle && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Vehicle</p>
                    <p className="font-bold mt-1">{onboardSuccess.vehicle?.bike}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Vehicle Reg ID</p>
                    <p className="text-lg font-black text-primary font-mono mt-1">{onboardSuccess.vehicle?.vehicleRegId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">VIN / Chassis</p>
                    <p className="font-mono text-sm mt-1">{onboardSuccess.vehicle?.vin}</p>
                  </div>
                  {onboardSuccess.vehicle?.nextServiceDate && (
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Next Service Due</p>
                      <p className="font-bold mt-1 text-orange-400">{onboardSuccess.vehicle?.nextServiceDate}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              {onboardSuccess.whatsappUrl && (
                <a href={onboardSuccess.whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-500 transition-colors py-3 rounded-xl font-black uppercase tracking-widest text-center text-sm flex items-center justify-center space-x-2">
                  <span>💬</span>
                  <span>SEND CREDENTIALS VIA WHATSAPP</span>
                </a>
              )}
              <div className="text-xs text-center text-gray-500">
                📧 Welcome email {onboardSuccess.customer?.email ? `sent to ${onboardSuccess.customer.email}` : 'attempted'}
              </div>
              <div className="flex space-x-4">
                <button onClick={closeOnboardModal} className="flex-1 btn-outline py-3 font-black uppercase">DONE</button>
                <button onClick={() => { setOnboardSuccess(null); }} className="flex-1 btn-primary py-3 font-black uppercase">+ ANOTHER</button>
              </div>
            </div>
          </div>

        ) : (
          /* FORM STATE */
          <form onSubmit={handleOnboardCustomer} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            <p className="text-xs font-bold uppercase text-primary tracking-widest border-b border-gray-200 pb-3">👤 Customer Details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Full Name *</label>
                <input required placeholder="e.g. Gaurav Patil" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                  value={onboardData.name} onChange={set('name')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Gmail / Email *</label>
                <input required type="email" placeholder="customer@gmail.com" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                  value={onboardData.email} onChange={set('email')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Phone *</label>
                <input required type="tel" placeholder="+91 98765 43210" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                  value={onboardData.phone} onChange={set('phone')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">WhatsApp No.</label>
                <input type="tel" placeholder="If different from phone" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                  value={onboardData.whatsapp} onChange={set('whatsapp')} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Home Address</label>
              <textarea rows="2" placeholder="Street, City, PIN code" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary resize-none"
                value={onboardData.address} onChange={set('address')} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Temporary Password *</label>
              <input required type="password" placeholder="Min 6 characters — customer can change later" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                value={onboardData.password} onChange={set('password')} />
            </div>

            <p className="text-xs font-bold uppercase text-primary tracking-widest border-b border-gray-200 pb-3 pt-2">🏍️ Vehicle Registration</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Bike Model *</label>
                <select required className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary font-bold"
                  value={onboardData.bikeId} onChange={set('bikeId')}>
                  <option value="" className="bg-white">Choose Model...</option>
                  {bikes.map(b => <option key={b.id} value={b.id} className="bg-white">{b.brand} — {b.modelName}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">VIN / Chassis No. *</label>
                <input required placeholder="e.g. MH12AB2026XXXX" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary font-bold"
                  value={onboardData.vin} onChange={set('vin')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Color</label>
                <input placeholder="e.g. Matte Black" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                  value={onboardData.color} onChange={set('color')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Purchase Date</label>
                <input type="date" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                  value={onboardData.purchaseDate} onChange={set('purchaseDate')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Next Service Date</label>
                <input type="date" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                  value={onboardData.nextServiceDate} onChange={set('nextServiceDate')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Service Every</label>
                <select className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary font-bold"
                  value={onboardData.serviceIntervalDays} onChange={set('serviceIntervalDays')}>
                  <option value="30" className="bg-white">Every Month</option>
                  <option value="60" className="bg-white">Every 2 Months</option>
                  <option value="90" className="bg-white">Every 3 Months</option>
                  <option value="180" className="bg-white">Every 6 Months</option>
                  <option value="365" className="bg-white">Annually</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Notes</label>
              <textarea rows="2" placeholder="Extra info about this registration..." className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary resize-none"
                value={onboardData.notes} onChange={set('notes')} />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-gray-500">
              💡 A unique <span className="text-primary font-bold">Customer ID</span> (e.g. BAF-CX-XXXX) and <span className="text-primary font-bold">Vehicle Reg ID</span> (e.g. BAF-VH-XXXX) will be auto-generated.
            </div>

            <button type="submit" className="btn-primary w-full py-4 font-black uppercase tracking-widest flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>ONBOARD CUSTOMER & REGISTER VEHICLE</span>
            </button>
          </form>
        )}
      </Modal>



      <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="Broadcast to All Users">
        <div className="space-y-6">
          <p className="text-gray-500 text-sm">This message will be sent to every registered user in your database. Use this for major announcements or showroom updates.</p>
          <textarea
            rows="4"
            placeholder="Type your announcement..."
            className="w-full bg-[#f5f5f7] border border-gray-200 rounded-2xl p-6 outline-none focus:border-primary resize-none"
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
          />
          <button
            onClick={handleBroadcast}
            className="btn-primary w-full py-4 font-black uppercase tracking-widest"
          >
            DISPATCH TO ALL USERS
          </button>
        </div>
      </Modal>

      {/* ── EDIT CUSTOMER MODAL ──────────────────────────── */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit — ${editUser?.name}`}>
        <form onSubmit={handleUpdateCustomer} className="space-y-4">
          <p className="text-xs font-bold uppercase text-primary tracking-widest border-b border-gray-200 pb-3">
            Customer ID: <span className="font-mono text-[#1d1d1f]">{editUser?.customerId || '—'}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Full Name *</label>
              <input required className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Email</label>
              <input disabled className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 text-gray-500 cursor-not-allowed"
                value={editUser?.email || ''} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Phone</label>
              <input type="tel" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">WhatsApp</label>
              <input type="tel" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                value={editData.whatsapp} onChange={e => setEditData(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Home Address</label>
            <textarea rows="2" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary resize-none"
              value={editData.address} onChange={e => setEditData(p => ({ ...p, address: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Vehicle Category</label>
            <select className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary font-bold"
              value={editData.vehicleCategory} onChange={e => setEditData(p => ({ ...p, vehicleCategory: e.target.value }))}>
              <option value="" className="bg-white">Select...</option>
              <option value="Yakuza" className="bg-white">Yakuza</option>
              <option value="Ola Electric" className="bg-white">Ola Electric</option>
              <option value="Ather" className="bg-white">Ather</option>
              <option value="TVS" className="bg-white">TVS iQube</option>
              <option value="Other" className="bg-white">Other</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-2">
            <button type="button" onClick={() => setEditUser(null)} className="flex-1 btn-outline py-3 font-black uppercase">Cancel</button>
            <button type="submit" className="flex-1 btn-primary py-3 font-black uppercase flex items-center justify-center space-x-2">
              <Pencil className="w-4 h-4" /><span>SAVE CHANGES</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

// ── SALES BY DATE RANGE ANALYTICS + REPORT ───────────────────────────────────
const SalesByDate = () => {
  const today = new Date().toISOString().substring(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10);

  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(today);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleSearch = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    setShowReport(false);
    try {
      const { data } = await api.get(`/admin/sales-by-date?fromDate=${fromDate}&toDate=${toDate}`);
      setResult(data);
      setShowReport(true);
    } catch (e) {
      alert('Failed to fetch sales data: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('sales-report-printable');
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Sales Report — bafna E-BYKES</title>
      <style>
        body { font-family: sans-serif; padding: 32px; color: #111; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        p.sub { color: #666; margin-bottom: 24px; font-size: 13px; }
        .stats { display: flex; gap: 32px; margin-bottom: 24px; }
        .stat { background: #f3f4f6; border-radius: 12px; padding: 16px 24px; }
        .stat .label { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: bold; letter-spacing: 2px; }
        .stat .value { font-size: 28px; font-weight: 900; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #111; color: white; padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        td { padding: 10px 16px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        tr:nth-child(even) { background: #f9fafb; }
        .total-row td { font-weight: 900; background: #ecfdf5; border-top: 2px solid #10b981; }
        @media print { button { display: none; } }
      </style></head><body>
      ${printContent.innerHTML}
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase text-primary tracking-widest flex items-center">
          📊 Sales Report — Date Range
        </p>
        {result && (
          <button onClick={handlePrint} className="text-xs font-black uppercase tracking-widest bg-[#f5f5f7] border border-gray-200 hover:border-primary/30 rounded-lg px-4 py-2 flex items-center space-x-2 transition-all">
            🖨️ <span className="ml-2">PRINT REPORT</span>
          </button>
        )}
      </div>

      {/* Date Range Inputs */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">From Date</label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            max={toDate}
            className="bg-[#f5f5f7] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">To Date</label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            min={fromDate} max={today}
            className="bg-[#f5f5f7] border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary" />
        </div>
        <button onClick={handleSearch} disabled={loading}
          className="btn-primary px-8 py-3 font-black uppercase text-sm disabled:opacity-50">
          {loading ? 'Loading...' : 'GENERATE REPORT'}
        </button>
      </div>

      {/* Summary Stats */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Vehicles Sold</p>
            <p className="text-3xl font-black text-primary mt-1">{result.count}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase text-green-400 tracking-widest">Total Revenue</p>
            <p className="text-3xl font-black text-green-400 mt-1">₹{Number(result.profit).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-[#f5f5f7] border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Period</p>
            <p className="text-sm font-black text-[#1d1d1f] mt-1">
              {new Date(result.fromDate).toLocaleDateString('en-IN')} → {new Date(result.toDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Report Table */}
      {showReport && result?.sales?.length > 0 && (
        <div id="sales-report-printable">
          {/* Print header (hidden in UI) */}
          <div className="hidden print-only">
            <h1>bafna E-BYKES — Sales Report</h1>
            <p className="sub">Period: {new Date(result.fromDate).toLocaleDateString('en-IN')} to {new Date(result.toDate).toLocaleDateString('en-IN')} | Total Vehicles: {result.count} | Total Revenue: ₹{Number(result.profit).toLocaleString('en-IN')}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f8f8fa] border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-bold uppercase text-gray-500 tracking-widest rounded-tl-xl">#</th>
                  <th className="px-4 py-3 text-left font-bold uppercase text-gray-500 tracking-widest">Customer</th>
                  <th className="px-4 py-3 text-left font-bold uppercase text-gray-500 tracking-widest hidden sm:table-cell">Customer ID</th>
                  <th className="px-4 py-3 text-left font-bold uppercase text-gray-500 tracking-widest">Bike / Vehicle</th>
                  <th className="px-4 py-3 text-left font-bold uppercase text-gray-500 tracking-widest hidden md:table-cell">VIN</th>
                  <th className="px-4 py-3 text-left font-bold uppercase text-gray-500 tracking-widest">Date</th>
                  <th className="px-4 py-3 text-right font-bold uppercase text-gray-500 tracking-widest rounded-tr-xl">Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {result.sales.map((s, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-[#f8f8fa]'}`}>
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#1d1d1f]">{s.customerName}</p>
                      <p className="text-gray-500">{s.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-gray-500">{s.customerId}</td>
                    <td className="px-4 py-3 font-bold">{s.bikeName}</td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-gray-500">{s.vin || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{s.purchaseDate ? new Date(s.purchaseDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-500">
                      {s.price > 0 ? `₹${s.price.toLocaleString('en-IN')}` : '—'}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-green-50 border-t-2 border-green-200">
                  <td colSpan={5} className="px-4 py-3 font-bold uppercase text-gray-500 tracking-widest text-xs rounded-bl-xl">Total Revenue</td>
                  <td className="px-4 py-3 font-bold uppercase text-gray-500 text-xs">{result.count} units</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600 text-sm rounded-br-xl">
                    ₹{Number(result.profit).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showReport && result?.sales?.length === 0 && (
        <div className="text-center py-8 text-gray-500 italic">
          No vehicles sold in this date range.
        </div>
      )}
    </div>
  );
};

export default UserManager;
