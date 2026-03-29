import React, { useState, useEffect } from 'react';
import { Check, X, Calendar, Wrench, User, Bike as BikeIcon, Send, Download, Trash2, Plus, Minus } from 'lucide-react';
import api, { API_URL } from '../../../services/api';

const BookingManager = ({ type = 'testrides' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([
    { name: 'Service Charge', quantity: 1, price: 500 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      const endpoint = type === 'testrides' ? '/bookings' : '/services';
      const { data } = await api.get(endpoint);
      setData(data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, items = null) => {
    try {
      const endpoint = type === 'testrides' ? `/admin/bookings/${id}` : `/admin/services/${id}`;
      const payload = { status };
      if (items) payload.items = items;

      await api.patch(endpoint, payload);
      fetchData();
      setShowServiceModal(false);
      setSelectedService(null);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const openCompletionModal = (item) => {
    setSelectedService(item);
    setInvoiceItems([
      { name: `Service Charge (${item.serviceType.toUpperCase()})`, quantity: 1, price: 500 },
      { name: '', quantity: 1, price: 0 }
    ]);
    setShowServiceModal(true);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { name: '', quantity: 1, price: 0 }]);
  };

  const removeInvoiceItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    setInvoiceItems(newItems);
  };

  const searchStock = async (val) => {
    setSearchTerm(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get(`/stock/search?q=${val}`);
      setSearchResults(data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const addStockToInvoice = (stockItem) => {
    setInvoiceItems([
      ...invoiceItems,
      {
        name: stockItem.name,
        quantity: 1,
        price: stockItem.sellingPrice,
        stockItemId: stockItem.id
      }
    ]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this record?')) return;
    try {
      const endpoint = type === 'testrides' ? `/admin/bookings/delete/${id}` : `/admin/services/delete/${id}`;
      await api.post(endpoint);
      fetchData();
    } catch (err) {
      alert('Failed to delete record: ' + (err.response?.data?.message || err.message));
    }
  };

  const getWhatsAppUrl = (item) => {
    if (!item.User?.phone) return null;

    const branding = `\n\nGive your Feedback: https://bafna-frontend.onrender.com/feedback\n\nBAFNA E-BYKES\n24, Sai Baba Colony, Behind Agrasen Bhavan, Karwand Naka, Shirpur, Dist. Dhule, Maharashtra - 425405\nContact: 7558533371 / 7709616271\nEmail: bafnaebykes@gmail.com`;

    const API_BASE = import.meta.env.VITE_API_URL || 'https://bafna-ebykes.onrender.com';

    let message = '';
    if (type === 'testrides') {
      message = `Hello, ${item.User.name}\n\nYour test ride for ${item.Bike?.brand} ${item.Bike?.modelName} is APPROVED\n\nDate: ${item.bookingDate}\nTime: ${item.timeSlot}${branding}`;
    } else {
      let statusMsg = '';
      if (item.status === 'completed') {
        const pdfUrl = `${API_BASE}/api/services/${item.id}/invoice`;
        statusMsg = `is COMPLETED\n\nTotal Bill: Rs. ${Number(item.cost).toFixed(2)}\n\nDownload Your Invoice (PDF):\n${pdfUrl}\n\nYour invoice has also been sent to your email.${branding}`;
      } else {
        statusMsg = `has been APPROVED\n\nDate: ${item.appointmentDate}\n\nPlease bring your vehicle to the showroom.${branding}`;
      }
      message = `Hello, ${item.User.name}\n\nYour service appointment ${statusMsg}`;
    }

    return `https://wa.me/${item.User.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const handleDownloadInvoice = async (id) => {
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
    <>
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left bg-[#f8f8fa]">
                <th className="py-4 px-6 text-xs font-bold uppercase text-gray-500 tracking-widest rounded-tl-xl">Customer</th>
                <th className="py-4 px-6 text-xs font-bold uppercase text-gray-500 tracking-widest">Subject</th>
                <th className="py-4 px-6 text-xs font-bold uppercase text-gray-500 tracking-widest">Schedule</th>
                <th className="py-4 px-6 text-xs font-bold uppercase text-gray-500 tracking-widest">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase text-gray-500 tracking-widest text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 bg-white hover:bg-[#f8f8fa] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] border border-gray-200 shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1d1d1f]">{item.User?.name}</p>
                        <p className="text-xs text-gray-500">{item.User?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2 text-[#1d1d1f]">
                      {type === 'testrides' ? (
                        <>
                          <BikeIcon className="w-4 h-4 text-primary" />
                          <span className="font-bold">{item.Bike?.modelName}</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-4 h-4 text-gray-700" />
                          <span className="font-bold capitalize">{item.serviceType}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#1d1d1f]" />
                      <span className="text-[#1d1d1f] font-bold">{item.bookingDate || item.appointmentDate}</span>
                    </div>
                    {item.timeSlot && <p className="text-xs ml-6">{item.timeSlot}</p>}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase border shadow-sm ${item.status === 'approved' || item.status === 'completed' ? 'border-green-200 text-green-700 bg-green-50' :
                      item.status === 'pending' || item.status === 'in-progress' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                        'border-red-200 text-red-700 bg-red-50'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {item.status === 'pending' && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'approved')}
                          className="p-2 bg-[#f5f5f7] border border-transparent hover:border-gray-200 hover:bg-white text-green-600 rounded-lg transition-colors shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(item.id, 'rejected')}
                          className="p-2 bg-[#f5f5f7] border border-transparent hover:border-gray-200 hover:bg-white text-red-500 rounded-lg transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-[#f5f5f7] border border-transparent hover:border-red-200 hover:bg-red-50 text-red-400 rounded-lg transition-colors shadow-sm"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {(item.status === 'approved' || item.status === 'in-progress') && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => type === 'services' ? openCompletionModal(item) : handleStatusUpdate(item.id, 'completed')}
                          className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                          Mark Finished
                        </button>
                        {item.User?.phone && (
                          <a
                            href={getWhatsAppUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-all border border-green-200"
                            title="Send Approval WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-[#f5f5f7] border border-transparent hover:border-red-200 hover:bg-red-50 text-red-400 rounded-lg transition-colors shadow-sm"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {item.status === 'completed' && (
                      <div className="flex justify-end space-x-3">
                        {type === 'services' && (
                          <button
                            onClick={() => handleDownloadInvoice(item.id)}
                            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all shadow-sm border border-primary/20"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {item.User?.phone && (
                          <a
                            href={getWhatsAppUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20 transition-all border border-green-200"
                            title="Send Final WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-[#f5f5f7] border border-transparent hover:border-red-200 hover:bg-red-50 text-red-400 rounded-lg transition-colors shadow-sm"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && !loading && (
            <div className="py-20 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No records found in this queue.</p>
            </div>
          )}
        </div>
      </div>

      {showServiceModal && (
        <div className="fixed inset-0 bg-[#1d1d1f]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#f8f8fa]">
              <div className="flex-1 mr-8">
                <h2 className="text-2xl font-black uppercase text-[#1d1d1f] tracking-tight">Finalize Service Bill</h2>
                <div className="mt-4 relative">
                  <div className="flex items-center bg-white rounded-xl border border-gray-200 px-4 py-2 focus-within:border-primary shadow-sm transition-all">
                    <Plus className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => searchStock(e.target.value)}
                      placeholder="Search parts by name or SKU..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium"
                    />
                    {searching && <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin ml-2" />}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[60] max-h-60 overflow-y-auto overflow-hidden">
                      {searchResults.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addStockToInvoice(item)}
                          className="w-full text-left px-6 py-4 hover:bg-[#f5f5f7] flex items-center justify-between border-b border-gray-100 last:border-none transition-colors"
                        >
                          <div>
                            <p className="font-bold text-[#1d1d1f]">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{item.sku || 'No SKU'} • Stock: {item.quantity}</p>
                          </div>
                          <p className="font-black text-primary">₹{item.sellingPrice}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-3 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest px-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Price (₹)</div>
                  <div className="col-span-1"></div>
                </div>

                {invoiceItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center bg-[#f5f5f7] p-3 rounded-2xl">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateInvoiceItem(index, 'name', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 font-bold"
                        placeholder="Item name..."
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)}
                        className="w-full bg-transparent border-none text-center focus:ring-0 font-bold"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateInvoiceItem(index, 'price', e.target.value)}
                        className="w-full bg-transparent border-none text-right focus:ring-0 font-bold"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeInvoiceItem(index)} className="text-red-400 hover:text-red-600">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addInvoiceItem}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-primary hover:border-primary transition-all font-bold flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            <div className="p-8 bg-[#f8f8fa] border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Grand Total</p>
                <p className="text-3xl font-black text-primary">₹{calculateTotal().toLocaleString()}</p>
              </div>
              <div className="flex space-x-4 text-sm font-bold">
                <button onClick={() => setShowServiceModal(false)} className="px-6 py-3 text-gray-500">Cancel</button>
                <button
                  onClick={() => handleStatusUpdate(selectedService.id, 'completed', invoiceItems)}
                  className="px-8 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                >
                  Confirm & Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingManager;
