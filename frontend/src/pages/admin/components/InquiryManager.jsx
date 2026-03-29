import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Trash2, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import api from '../../../services/api';

const InquiryManager = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data } = await api.get('/messages');
      setInquiries(data);
    } catch (err) {
      console.error('Error fetching inquiries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`);
      fetchInquiries();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading inquiries...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {inquiries.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-[32px] p-8 border ${item.isRead ? 'border-gray-100 opacity-75' : 'border-primary/20 shadow-xl shadow-primary/5'} transition-all`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl ${item.isRead ? 'bg-gray-100' : 'bg-primary/10'}`}>
                      <User className={`w-6 h-6 ${item.isRead ? 'text-gray-400' : 'text-primary'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1d1d1f] tracking-tight truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">#{item.id} Inquiry</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-gray-600 bg-[#f5f5f7] p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-bold truncate">{item.email}</span>
                  </div>
                  {item.phone && (
                    <div className="flex items-center space-x-3 text-gray-600 bg-[#f5f5f7] p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-bold">{item.phone}</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#f8f8fa] rounded-2xl p-6 border border-gray-100">
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3 flex items-center">
                    <MessageSquare className="w-3 h-3 mr-2" /> Message Content
                  </h4>
                  <p className="text-[#1d1d1f] leading-relaxed font-medium">
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-3 mt-4 md:mt-0">
                {!item.isRead && (
                  <button
                    onClick={() => handleToggleRead(item.id)}
                    className="flex-1 md:flex-none p-4 bg-primary text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                    title="Mark as Read"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                )}
                {/* 
                  Note: The current backend doesn't have a DELETE /messages/:id, 
                  but we could add it if needed. For now, keep it simple.
                */}
              </div>
            </div>
          </div>
        ))}

        {inquiries.length === 0 && (
          <div className="py-32 text-center bg-[#f5f5f7] rounded-[48px] border-2 border-dashed border-gray-200">
            <Mail className="w-16 h-16 mx-auto mb-6 opacity-10" />
            <p className="text-xl font-black text-gray-400 uppercase tracking-widest">No Inquiries Yet</p>
            <p className="text-gray-400 text-sm mt-2">When customers contact you, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryManager;
