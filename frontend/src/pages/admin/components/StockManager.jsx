import React, { useState, useEffect } from 'react';
import { Plus, Package, ShoppingCart, AlertTriangle, TrendingUp, RefreshCw, Trash2, Edit2, ArrowLeft, Receipt } from 'lucide-react';
import api from '../../../services/api';
import Modal from './Modal';

const CATEGORIES = ['Brakes', 'Tyres', 'Battery', 'Accessories', 'Body Parts', 'Electrical', 'Lighting', 'Other'];

// ── Bill Print Utility ────────────────────────────────────────────────────────
const printBill = (sale) => {
  const win = window.open('', '_blank');
  const date = new Date(sale.createdAt || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'long' });
  const time = new Date(sale.createdAt || Date.now()).toLocaleTimeString('en-IN');
  win.document.write(`
    <html><head><title>Bill — ${sale.billNo}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Segoe UI', sans-serif; padding:40px; color:#111; max-width:600px; margin:0 auto; }
      .header { text-align:center; border-bottom:3px solid #10b981; padding-bottom:20px; margin-bottom:24px; }
      .logo { font-size:28px; font-weight:900; text-transform:uppercase; letter-spacing:2px; }
      .logo span { color:#10b981; }
      .sub { color:#6b7280; font-size:12px; margin-top:4px; }
      .bill-info { display:flex; justify-content:space-between; margin-bottom:24px; }
      .bill-info div { font-size:13px; }
      .label { color:#6b7280; font-size:10px; text-transform:uppercase; font-weight:700; letter-spacing:1px; }
      .value { font-weight:700; margin-top:3px; }
      .customer { background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin-bottom:24px; }
      table { width:100%; border-collapse:collapse; margin-bottom:16px; }
      th { background:#111; color:#fff; padding:10px 14px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; }
      td { padding:10px 14px; border-bottom:1px solid #e5e7eb; font-size:13px; }
      .totals { margin-left:auto; width:260px; }
      .totals tr:last-child td { font-weight:900; font-size:16px; color:#10b981; border-top:2px solid #10b981; padding-top:12px; }
      .footer { text-align:center; margin-top:40px; padding-top:16px; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:11px; }
      @media print { button { display:none; } }
    </style></head>
    <body>
      <div class="header">
        <div style="display:flex; justify-content:center; align-items:center; gap:12px; margin-bottom:12px;">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" stroke="#1d1d1f" stroke-width="7" stroke-linejoin="round" />
            <rect x="30" y="30" width="40" height="40" fill="#f5f5f7" rx="8" />
            <path d="M 54 20 L 32 54 h 18 l -6 28 L 74 44 H 54 l 4 -24 Z" fill="#10b981" />
          </svg>
          <div style="text-align:left; line-height:1;">
            <div style="font-size:22px; font-weight:900; color:#111; letter-spacing:-1px;">BAFNA <span style="font-weight:400; color:#d1d5db; margin:0 4px;">|</span> <span style="color:#10b981">E-BYKES</span></div>
            <div style="font-size:9px; font-weight:800; color:#9ca3af; letter-spacing:2px; margin-top:4px;">INTELLIGENT E-MOBILITY</div>
          </div>
        </div>
        <div class="sub">Electric Vehicle Showroom & Service Centre</div>
      </div>

      <div class="bill-info">
        <div>
          <div class="label">Bill Number</div>
          <div class="value">${sale.billNo}</div>
        </div>
        <div style="text-align:right">
          <div class="label">Date & Time</div>
          <div class="value">${date}, ${time}</div>
        </div>
      </div>

      <div class="customer">
        <div class="label" style="margin-bottom:10px">Customer Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
          <div><span style="color:#6b7280">Name:</span> <strong>${sale.customerName}</strong></div>
          <div><span style="color:#6b7280">WhatsApp:</span> ${sale.customerWhatsapp || '—'}</div>
          <div><span style="color:#6b7280">Email:</span> ${sale.customerEmail || '—'}</div>
          <div><span style="color:#6b7280">Address:</span> ${sale.customerAddress || '—'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${sale.StockItem?.name || sale.itemName || 'Item'}</td>
            <td>${sale.quantitySold} ${sale.StockItem?.unit || 'pcs'}</td>
            <td>₹${Number(sale.unitPrice).toLocaleString('en-IN')}</td>
            <td>₹${Number(sale.totalAmount).toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <table class="totals">
        <tr><td>Subtotal</td><td>₹${Number(sale.totalAmount).toLocaleString('en-IN')}</td></tr>
        <tr><td>Tax (incl.)</td><td>—</td></tr>
        <tr><td><strong>TOTAL</strong></td><td><strong>₹${Number(sale.totalAmount).toLocaleString('en-IN')}</strong></td></tr>
      </table>

      ${sale.notes ? `<div style="margin-top:20px;padding:12px;background:#f0fdf4;border-radius:8px;font-size:13px"><strong>Notes:</strong> ${sale.notes}</div>` : ''}

      <div class="footer">
        Thank you for choosing bafna E-BYKES! 🏍️<br/>
        This is a computer generated bill.
      </div>
      <script>window.onload = () => window.print();</script>
    </body></html>`);
  win.document.close();
};

// ── Main Component ────────────────────────────────────────────────────────────
const StockManager = () => {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('items'); // 'items' | 'sales'
  const [selectedItem, setSelectedItem] = useState(null);

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(null); // holds item to sell
  const [isRestockOpen, setIsRestockOpen] = useState(null); // holds item to restock
  const [lastBill, setLastBill] = useState(null);

  // Form state
  const [itemForm, setItemForm] = useState({ name: '', sku: '', category: 'Accessories', description: '', dealerPrice: '', sellingPrice: '', quantity: '', unit: 'pcs', lowStockAlert: '5' });
  const [sellForm, setSellForm] = useState({ quantitySold: '1', customerName: '', customerEmail: '', customerWhatsapp: '', customerAddress: '', notes: '' });
  const [restockQty, setRestockQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [itemsRes, salesRes] = await Promise.all([
        api.get('/stock'),
        api.get('/stock/sales')
      ]);
      setItems(itemsRes.data);
      setSales(salesRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── CRUD Handlers ─────────────────────────────────────────────────────────
  const handleAddItem = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/stock', itemForm);
      setIsAddItemOpen(false);
      resetItemForm();
      fetchAll();
    } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
    finally { setSaving(false); }
  };

  const handleEditItem = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/stock/${selectedItem.id}`, itemForm);
      setIsEditItemOpen(false);
      fetchAll();
    } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
    finally { setSaving(false); }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from inventory?`)) return;
    try { await api.delete(`/stock/${item.id}`); fetchAll(); }
    catch (e) { alert('Delete failed'); }
  };

  const handleRestock = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post(`/stock/${isRestockOpen.id}/restock`, { qty: restockQty });
      setIsRestockOpen(null); setRestockQty('');
      fetchAll();
    } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
    finally { setSaving(false); }
  };

  const handleSell = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/stock/sell', { stockItemId: isSellOpen.id, ...sellForm });
      setIsSellOpen(null);
      resetSellForm();
      setLastBill(data.sale);
      fetchAll();
    } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
    finally { setSaving(false); }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setItemForm({ name: item.name, sku: item.sku || '', category: item.category || 'Accessories', description: item.description || '', dealerPrice: item.dealerPrice, sellingPrice: item.sellingPrice, quantity: item.quantity, unit: item.unit || 'pcs', lowStockAlert: item.lowStockAlert || 5 });
    setIsEditItemOpen(true);
  };

  const resetItemForm = () => setItemForm({ name: '', sku: '', category: 'Accessories', description: '', dealerPrice: '', sellingPrice: '', quantity: '', unit: 'pcs', lowStockAlert: '5' });
  const resetSellForm = () => setSellForm({ quantitySold: '1', customerName: '', customerEmail: '', customerWhatsapp: '', customerAddress: '', notes: '' });

  const totalStockValue = items.reduce((s, i) => s + (Number(i.sellingPrice) * Number(i.quantity)), 0);
  const totalItems = items.length;
  const lowStockItems = items.filter(i => i.quantity <= i.lowStockAlert).length;
  const totalSalesRevenue = sales.reduce((s, s2) => s + Number(s2.totalAmount), 0);

  // ── INPUT HELPER ──────────────────────────────────────────────────────────
  const F = (field) => (e) => setItemForm(p => ({ ...p, [field]: e.target.value }));
  const SF = (field) => (e) => setSellForm(p => ({ ...p, [field]: e.target.value }));

  if (loading) return <div className="py-24 text-center text-gray-500">Loading inventory...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Stock Management</h2>
          <p className="text-gray-500 text-sm">Manage spare parts & accessories inventory, sell and generate bills.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setView(view === 'items' ? 'sales' : 'items')} className="btn-outline py-3 px-5 font-black text-sm flex items-center space-x-2">
            {view === 'items' ? <><Receipt className="w-4 h-4" /><span>SALES HISTORY</span></> : <><Package className="w-4 h-4" /><span>STOCK ITEMS</span></>}
          </button>
          {view === 'items' && (
            <button onClick={() => setIsAddItemOpen(true)} className="btn-primary py-3 px-5 font-black text-sm flex items-center space-x-2">
              <Plus className="w-4 h-4" /><span>ADD ITEM</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalItems, icon: '📦', color: 'primary' },
          { label: 'Stock Value', value: `₹${totalStockValue.toLocaleString('en-IN')}`, icon: '💰', color: 'green' },
          { label: 'Low Stock Alerts', value: lowStockItems, icon: '⚠️', color: 'yellow' },
          { label: 'Total Revenue', value: `₹${totalSalesRevenue.toLocaleString('en-IN')}`, icon: '📈', color: 'blue' },
        ].map((s, i) => (
          <div key={i} className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{s.label}</p>
            <p className="text-xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── STOCK ITEMS LIST ── */}
      {view === 'items' && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f8fa]">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest rounded-tl-xl">Item</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest hidden md:table-cell">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest hidden lg:table-cell">Dealer Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest">Sell Price</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500 tracking-widest rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const isLow = item.quantity <= item.lowStockAlert;
                return (
                  <tr key={item.id} className={`border-b border-gray-100 bg-white hover:bg-[#f8f8fa] transition-colors ${isLow ? 'bg-yellow-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold">{item.name}</p>
                      {item.sku && <p className="text-xs text-gray-500 font-mono">{item.sku}</p>}
                      {item.description && <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs bg-white border border-gray-200 shadow-sm px-2 py-1 rounded-lg">{item.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isLow ? 'text-yellow-600' : 'text-[#1d1d1f]'}`}>{item.quantity}</span>
                        <span className="text-xs text-gray-500">{item.unit}</span>
                        {isLow && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-gray-500">₹{Number(item.dealerPrice).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 font-bold text-green-400">₹{Number(item.sellingPrice).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => setIsRestockOpen(item)} title="Restock" className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-all text-xs font-bold"><RefreshCw className="w-4 h-4" /></button>
                        <button onClick={() => setIsSellOpen(item)} title="Sell / Create Bill" className="p-2 rounded-lg hover:bg-green-50 text-green-500 transition-all"><ShoppingCart className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(item)} title="Edit" className="p-2 rounded-lg hover:bg-gray-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteItem(item)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="py-20 text-center text-gray-500">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="italic">No stock items yet. Click "Add Item" to begin.</p>
            </div>
          )}
        </div>
      )}

      {/* ── SALES HISTORY ── */}
      {view === 'sales' && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f8f8fa]">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest rounded-tl-xl">Bill No</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest hidden md:table-cell">Item</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest">Qty</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest hidden lg:table-cell">Profit</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500 tracking-widest hidden lg:table-cell">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase text-gray-500 tracking-widest rounded-tr-xl">Bill</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => (
                <tr key={s.id} className={`border-b border-gray-100 hover:bg-[#f5f5f7] ${i % 2 ? 'bg-white shadow-sm/[0.02]' : ''}`}>
                  <td className="px-6 py-4 font-mono text-xs text-primary">{s.billNo}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{s.customerName}</p>
                    <p className="text-xs text-gray-500">{s.customerWhatsapp || s.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">{s.StockItem?.name || '—'}</td>
                  <td className="px-6 py-4">{s.quantitySold} {s.StockItem?.unit || 'pcs'}</td>
                  <td className="px-6 py-4 font-bold text-green-500">₹{Number(s.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-blue-500 font-bold">₹{Number(s.profit).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-gray-500 text-xs">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => printBill(s)} className="btn-outline py-2 px-3 text-xs font-bold bg-[#f5f5f7] border-gray-200 hover:bg-white shadow-sm flex items-center space-x-1 ml-auto">
                      <Receipt className="w-3 h-3" /><span>PRINT</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && (
            <div className="py-16 text-center text-gray-500 italic">No sales recorded yet.</div>
          )}
        </div>
      )}

      {/* ── LAST BILL POPUP ── */}
      {lastBill && (
        <Modal isOpen={!!lastBill} onClose={() => setLastBill(null)} title={`✅ Sale Complete — ${lastBill.billNo}`}>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-green-400 font-black text-lg">Bill Generated!</p>
              <p className="text-gray-500 text-sm mt-1">Bill No: <span className="font-mono text-[#1d1d1f]">{lastBill.billNo}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f5f5f7] rounded-xl p-4">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Customer</p>
                <p className="font-bold mt-1">{lastBill.customerName}</p>
              </div>
              <div className="bg-[#f5f5f7] rounded-xl p-4">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Amount</p>
                <p className="font-black text-green-400 text-xl mt-1">₹{Number(lastBill.totalAmount).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <button onClick={() => printBill(lastBill)} className="btn-primary w-full py-4 font-black uppercase flex items-center justify-center space-x-2">
              <Receipt className="w-5 h-5" /><span>PRINT BILL</span>
            </button>
            <button onClick={() => setLastBill(null)} className="btn-outline w-full py-3 font-black uppercase">CLOSE</button>
          </div>
        </Modal>
      )}

      {/* ── ADD ITEM MODAL ── */}
      <Modal isOpen={isAddItemOpen} onClose={() => { setIsAddItemOpen(false); resetItemForm(); }} title="Add Stock Item">
        <form onSubmit={handleAddItem} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Item Name *</label>
              <input required value={itemForm.name} onChange={F('name')} placeholder="e.g. Brake Pad Set" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">SKU / Part Number</label>
              <input value={itemForm.sku} onChange={F('sku')} placeholder="BRK-001" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Category</label>
              <select value={itemForm.category} onChange={F('category')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Dealer Price (₹) *</label>
              <input required type="number" min="0" value={itemForm.dealerPrice} onChange={F('dealerPrice')} placeholder="Cost from supplier" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Selling Price (₹) *</label>
              <input required type="number" min="0" value={itemForm.sellingPrice} onChange={F('sellingPrice')} placeholder="Price to customer" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            {itemForm.dealerPrice && itemForm.sellingPrice && (
              <div className="md:col-span-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm">
                💰 Profit per unit: <strong className="text-green-400">₹{(Number(itemForm.sellingPrice) - Number(itemForm.dealerPrice)).toLocaleString('en-IN')}</strong>
                &nbsp;({Math.round(((Number(itemForm.sellingPrice) - Number(itemForm.dealerPrice)) / Number(itemForm.dealerPrice || 1)) * 100)}% margin)
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Initial Stock Qty *</label>
              <input required type="number" min="0" value={itemForm.quantity} onChange={F('quantity')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Unit</label>
              <select value={itemForm.unit} onChange={F('unit')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary">
                {['pcs', 'set', 'pair', 'kg', 'litre', 'roll', 'box'].map(u => <option key={u} value={u} className="bg-white">{u}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Low Stock Alert (at qty ≤)</label>
              <input type="number" min="0" value={itemForm.lowStockAlert} onChange={F('lowStockAlert')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Description</label>
            <textarea rows="2" value={itemForm.description} onChange={F('description')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary resize-none" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-4 font-black uppercase disabled:opacity-50">
            {saving ? 'Adding...' : 'ADD TO INVENTORY'}
          </button>
        </form>
      </Modal>

      {/* ── EDIT ITEM MODAL ── */}
      <Modal isOpen={isEditItemOpen} onClose={() => setIsEditItemOpen(false)} title={`Edit — ${selectedItem?.name}`}>
        <form onSubmit={handleEditItem} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Item Name *</label>
              <input required value={itemForm.name} onChange={F('name')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Dealer Price (₹)</label>
              <input type="number" min="0" value={itemForm.dealerPrice} onChange={F('dealerPrice')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Selling Price (₹)</label>
              <input type="number" min="0" value={itemForm.sellingPrice} onChange={F('sellingPrice')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Category</label>
              <select value={itemForm.category} onChange={F('category')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Low Stock Alert</label>
              <input type="number" min="0" value={itemForm.lowStockAlert} onChange={F('lowStockAlert')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Description</label>
            <textarea rows="2" value={itemForm.description} onChange={F('description')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary resize-none" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-4 font-black uppercase disabled:opacity-50">
            {saving ? 'Saving...' : 'SAVE CHANGES'}
          </button>
        </form>
      </Modal>

      {/* ── RESTOCK MODAL ── */}
      <Modal isOpen={!!isRestockOpen} onClose={() => { setIsRestockOpen(null); setRestockQty(''); }} title={`Restock — ${isRestockOpen?.name}`}>
        <form onSubmit={handleRestock} className="space-y-4">
          <div className="bg-[#f5f5f7] rounded-xl p-4 text-sm">
            Current Stock: <strong className="text-primary text-lg">{isRestockOpen?.quantity} {isRestockOpen?.unit}</strong>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Quantity to Add *</label>
            <input required type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="e.g. 50" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 text-2xl font-black outline-none focus:border-primary" />
          </div>
          {restockQty && (
            <div className="text-sm text-gray-500">
              New total: <strong className="text-[#1d1d1f]">{Number(isRestockOpen?.quantity) + Number(restockQty)} {isRestockOpen?.unit}</strong>
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full py-4 font-black uppercase disabled:opacity-50">
            {saving ? 'Adding...' : '+ ADD STOCK'}
          </button>
        </form>
      </Modal>

      {/* ── SELL MODAL ── */}
      <Modal isOpen={!!isSellOpen} onClose={() => { setIsSellOpen(null); resetSellForm(); }} title={`Sell — ${isSellOpen?.name}`}>
        <form onSubmit={handleSell} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f5f5f7] rounded-xl p-4">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Available</p>
              <p className="text-2xl font-black text-primary mt-1">{isSellOpen?.quantity} {isSellOpen?.unit}</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-xl p-4">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Unit Price</p>
              <p className="text-2xl font-black text-green-400 mt-1">₹{Number(isSellOpen?.sellingPrice).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Quantity to Sell *</label>
            <input required type="number" min="1" max={isSellOpen?.quantity} value={sellForm.quantitySold} onChange={SF('quantitySold')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 text-xl font-black outline-none focus:border-primary" />
          </div>

          {sellForm.quantitySold > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Amount:</span><strong className="text-green-400 text-lg">₹{(Number(isSellOpen?.sellingPrice) * Number(sellForm.quantitySold)).toLocaleString('en-IN')}</strong></div>
              <div className="flex justify-between text-xs text-gray-500"><span>Profit:</span><span className="text-blue-400">₹{((Number(isSellOpen?.sellingPrice) - Number(isSellOpen?.dealerPrice)) * Number(sellForm.quantitySold)).toLocaleString('en-IN')}</span></div>
            </div>
          )}

          <p className="text-xs font-black uppercase text-primary tracking-widest pt-2 border-t border-gray-200">Customer Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Customer Name *</label>
              <input required value={sellForm.customerName} onChange={SF('customerName')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">WhatsApp No.</label>
              <input type="tel" value={sellForm.customerWhatsapp} onChange={SF('customerWhatsapp')} placeholder="+91..." className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Email</label>
              <input type="email" value={sellForm.customerEmail} onChange={SF('customerEmail')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Address</label>
              <textarea rows="2" value={sellForm.customerAddress} onChange={SF('customerAddress')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary resize-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Notes / Remarks</label>
              <input value={sellForm.notes} onChange={SF('notes')} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-3 outline-none focus:border-primary" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-4 font-black uppercase flex items-center justify-center space-x-2 disabled:opacity-50">
            <Receipt className="w-5 h-5" /><span>{saving ? 'Processing...' : 'SELL & GENERATE BILL'}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StockManager;
