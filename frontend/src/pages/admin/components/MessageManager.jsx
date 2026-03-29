import React, { useState, useEffect } from 'react';
import { Mail, Star, User, MessageSquare, Trash2, CheckCircle, Phone, Calendar } from 'lucide-react';
import api from '../../../services/api';

const MessageManager = ({ type = 'messages' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'messages' ? '/messages' : '/feedback';
      const { data } = await api.get(endpoint);
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'read' && type === 'messages') {
        await api.put(`/messages/${id}`);
        setData(data.map(m => m.id === id ? { ...m, isRead: true } : m));
      } else if (action === 'delete') {
        if (window.confirm(`Are you sure you want to delete this ${type === 'messages' ? 'inquiry' : 'review'}?`)) {
          const endpoint = type === 'messages' ? `/messages/${id}` : `/feedback/${id}`;
          await api.delete(endpoint);
          setData(data.filter(m => m.id !== id));
        }
      }
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading {type}...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {data.map((item) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-[32px] p-8 border transition-all ${
              type === 'messages' && !item.isRead 
                ? 'border-primary/20 shadow-xl shadow-primary/5' 
                : 'border-gray-100'
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                      type === 'messages' ? (item.isRead ? 'bg-gray-100' : 'bg-primary/10') : 'bg-yellow-50'
                    }`}>
                      {type === 'messages' ? (
                        <MessageSquare className={item.isRead ? 'text-gray-400' : 'text-primary'} />
                      ) : (
                        <Star className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1d1d1f] tracking-tight">
                        {type === 'messages' ? item.name : (item.User?.name || 'Anonymous')}
                        {type === 'messages' && !item.isRead && (
                          <span className="ml-3 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">NEW</span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        {type === 'messages' ? (item.subject || 'General Inquiry') : 'Customer Feedback'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-gray-600 bg-[#f5f5f7] p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-bold truncate">{type === 'messages' ? item.email : item.User?.email}</span>
                  </div>
                  {type === 'messages' && item.phone && (
                    <div className="flex items-center space-x-3 text-gray-600 bg-[#f5f5f7] p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-bold">{item.phone}</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#f8f8fa] rounded-2xl p-6 border border-gray-100">
                  <p className="text-[#1d1d1f] leading-relaxed font-medium italic">
                    "{type === 'messages' ? item.message : item.comment}"
                  </p>
                  {type === 'feedback' && (
                    <div className="mt-4 flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex lg:flex-col justify-end gap-3">
                {type === 'messages' && !item.isRead && (
                  <button 
                    onClick={() => handleAction(item.id, 'read')}
                    className="flex-1 lg:flex-none p-4 bg-primary text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                    title="Mark as Read"
                  >
                    <CheckCircle className="w-6 h-6 mx-auto" />
                  </button>
                )}
                <button 
                  onClick={() => handleAction(item.id, 'delete')}
                  className="flex-1 lg:flex-none p-4 bg-white text-red-500 border border-red-50 rounded-2xl hover:bg-red-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Delete"
                >
                  <Trash2 className="w-6 h-6 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="py-32 text-center bg-[#f5f5f7] rounded-[48px] border-2 border-dashed border-gray-200">
          <Mail className="w-16 h-16 mx-auto mb-6 opacity-10" />
          <p className="text-xl font-black text-gray-400 uppercase tracking-widest">No {type} found</p>
        </div>
      )}
    </div>
  );
};

export default MessageManager;
