import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronRight, Building2, Bike, ArrowLeft, X, LayoutDashboard } from 'lucide-react';
import api, { API_URL } from '../../../services/api';
import Modal from './Modal';

const BRAND_COLORS = [
  'from-red-500/20', 'from-yellow-500/20', 'from-blue-500/20',
  'from-purple-500/20', 'from-primary/20', 'from-pink-500/20',
  'from-orange-500/20', 'from-teal-500/20'
];

const CATEGORIES = [
  'No RTO / No Licence',
  'No RTO / PUC Required',
  'RTO Required / No Licence',
  'RTO Required / Licence Required',
];

const BikeManager = () => {
  const [bikes, setBikes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [currentBike, setCurrentBike] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [saving, setSaving] = useState(false);
  const [customFeatures, setCustomFeatures] = useState([{ name: '', value: '' }]);
  const [colorVariants, setColorVariants] = useState([{ name: '', existingImages: [] }]);
  const [existingImagesList, setExistingImagesList] = useState([]);

  useEffect(() => {
    if (currentBike) {
      setCustomFeatures(currentBike.customFeatures?.length ? currentBike.customFeatures : [{ name: '', value: '' }]);
      setColorVariants(currentBike.colorVariants?.length ? currentBike.colorVariants : [{ name: '', existingImages: [] }]);
      setExistingImagesList(currentBike.images || []);
    } else {
      setCustomFeatures([{ name: '', value: '' }]);
      setColorVariants([{ name: '', existingImages: [] }]);
      setExistingImagesList([]);
    }
  }, [currentBike]);

  const setMainImage = (index) => {
    if (index === 0) return;
    const newImages = [...existingImagesList];
    const targetImage = newImages.splice(index, 1)[0];
    newImages.unshift(targetImage);
    setExistingImagesList(newImages);
  };
  
  const removeExistingImage = (index) => {
    setExistingImagesList(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => setCustomFeatures([...customFeatures, { name: '', value: '' }]);
  const updateFeature = (index, field, val) => {
    const newF = [...customFeatures];
    newF[index][field] = val;
    setCustomFeatures(newF);
  };
  const removeFeature = (index) => setCustomFeatures(customFeatures.filter((_, i) => i !== index));

  const addColorVariant = () => setColorVariants([...colorVariants, { name: '', existingImages: [] }]);
  const updateColorVariant = (index, val) => {
    const newV = [...colorVariants];
    newV[index].name = val;
    setColorVariants(newV);
  };
  const removeColorVariant = (index) => setColorVariants(colorVariants.filter((_, i) => i !== index));

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [bikesRes, brandsRes] = await Promise.all([
        api.get('/bikes'),
        api.get('/bikes/brands')
      ]);
      setBikes(bikesRes.data);
      setBrands(brandsRes.data); // [{id, name}, ...]
    } catch (e) {
      console.error('Failed to load fleet data', e);
    } finally {
      setLoading(false);
    }
  };

  // ── Brand Management ─────────────────────────────────────────────────────
  const handleAddBrand = async () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    try {
      const { data } = await api.post('/bikes/brands', { name: trimmed });
      setBrands(prev => [...prev.filter(b => b.id !== data.id), data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewBrandName('');
      setIsBrandModalOpen(false);
    } catch (e) {
      alert('Failed to create brand: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteBrand = async (brand) => {
    const count = bikes.filter(b => b.brand === brand.name).length;
    if (!window.confirm(`Delete brand "${brand.name}"?${count > 0 ? ` This brand has ${count} bike(s) — they will stay but lose their brand.` : ''}`)) return;
    try {
      await api.delete(`/bikes/brands/${brand.id}`);
      setBrands(prev => prev.filter(b => b.id !== brand.id));
      if (selectedBrand?.id === brand.id) setSelectedBrand(null);
    } catch (e) {
      alert('Failed to delete brand');
    }
  };

  // ── Bike Management ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Retire this bike from the fleet?')) return;
    try {
      await api.delete(`/bikes/${id}`);
      setBikes(prev => prev.filter(b => b.id !== id));
    } catch (e) { alert('Failed to delete bike'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Natively use FormData to support multipart file uploads
    const formData = new FormData(e.target);

    // Override/append locked data correctly
    formData.set('brand', selectedBrand?.name);
    if (e.target.isFeatured) {
      formData.set('isFeatured', e.target.isFeatured.checked ? 'true' : 'false');
    }
    if (!formData.get('price')) formData.set('price', 0);
    formData.set('stock', 0); // Temporary default

    // If editing, pass existing images in their new ordered list state
    if (currentBike && existingImagesList.length > 0) {
      formData.set('existingImages', JSON.stringify(existingImagesList));
    } else if (currentBike) {
      // User deleted all existing images
      formData.set('existingImages', JSON.stringify([]));
    }

    // Append valid custom features (value is optional)
    const validFeatures = customFeatures.filter(f => f.name.trim());
    formData.set('customFeatures', JSON.stringify(validFeatures));

    // Append valid color variants
    const validColors = colorVariants.filter(c => c.name.trim());
    formData.set('colorVariants', JSON.stringify(validColors));

    try {
      if (currentBike) {
        await api.put(`/bikes/${currentBike.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/bikes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      await fetchAll();
      setIsModalOpen(false);
      setCurrentBike(null);
    } catch (err) {
      alert('Failed to save bike: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const bikesForBrand = selectedBrand
    ? bikes.filter(b => b.brand === selectedBrand.name && b.modelName.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // ──── BRAND GRID VIEW ─────────────────────────────────────────────────────
  if (!selectedBrand) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Brand Catalog</h2>
            <p className="text-gray-500 text-sm">Select a brand to manage its bikes, or create a new one.</p>
          </div>
          <button onClick={() => setIsBrandModalOpen(true)} className="btn-outline py-3 px-6 flex items-center space-x-2 font-black">
            <Plus className="w-5 h-5" /><span>CREATE BRAND</span>
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-20 italic">Loading brands...</p>
        ) : brands.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-[40px]">
            <Building2 className="w-12 h-12 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-bold">No brands yet. Create your first one!</p>
            <button onClick={() => setIsBrandModalOpen(true)} className="btn-primary mt-6 py-3 px-6 font-black">
              + Create Brand
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand, i) => {
              const count = bikes.filter(b => b.brand === brand.name).length;
              return (
                <div key={brand.id} className={`relative p-8 rounded-[32px] border border-gray-200 bg-gradient-to-br ${BRAND_COLORS[i % BRAND_COLORS.length]} to-transparent group`}>
                  <button
                    onClick={() => setSelectedBrand(brand)}
                    className="w-full text-left"
                  >
                    <Building2 className="w-10 h-10 text-[#1d1d1f] opacity-40 group-hover:opacity-80 group-hover:text-primary transition-all mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">{brand.name}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">
                      {count} Bike{count !== 1 ? 's' : ''} Listed
                    </p>
                    <div className="flex items-center text-primary text-xs font-black mt-4 opacity-0 group-hover:opacity-100 transition-all">
                      Manage Fleet <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand)}
                    className="absolute top-4 right-4 p-2 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                    title="Delete brand"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Brand Modal */}
        <Modal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} title="Create New Brand">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-500 tracking-widest">Brand Name</label>
              <input
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                placeholder="e.g. Revolt Motors"
                className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl p-4 outline-none focus:border-primary"
                onKeyDown={e => e.key === 'Enter' && handleAddBrand()}
                autoFocus
              />
            </div>
            <button onClick={handleAddBrand} className="btn-primary w-full py-4 font-black uppercase">
              CREATE BRAND
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  // ──── BIKES UNDER SELECTED BRAND ─────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => { setSelectedBrand(null); setSearchTerm(''); }} className="p-3 bg-[#f5f5f7] border border-gray-200 rounded-xl hover:border-primary/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Brand</p>
            <h2 className="text-2xl font-black uppercase tracking-tight">{selectedBrand.name}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text" placeholder="Search models..."
              className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 pl-12 pr-6 outline-none focus:border-primary"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => { setCurrentBike(null); setIsModalOpen(true); }} className="btn-primary py-3 px-6 flex items-center space-x-2 font-black whitespace-nowrap">
            <Plus className="w-5 h-5" /><span>ADD BIKE</span>
          </button>
        </div>
      </div>

      {bikesForBrand.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-[40px]">
          <Bike className="w-12 h-12 mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 font-bold">No bikes under {selectedBrand.name} yet.</p>
          <button onClick={() => { setCurrentBike(null); setIsModalOpen(true); }} className="btn-primary mt-6 py-3 px-6 font-black">
            + Add First Bike
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bikesForBrand.map(bike => (
            <div key={bike.id} className="bg-white shadow-sm border border-gray-200 rounded-3xl overflow-hidden group">
              <div className="aspect-video relative overflow-hidden bg-white p-6 border-b border-gray-100 flex items-center justify-center">
                <img
                  src={
                    (bike.images && bike.images.length > 0) 
                      ? (bike.images[0].startsWith('http') ? bike.images[0] : `${API_URL}${bike.images[0]}`) 
                      : (bike.colorVariants && bike.colorVariants.length > 0 && bike.colorVariants[0].images && bike.colorVariants[0].images.length > 0) ? (bike.colorVariants[0].images[0].startsWith('http') ? bike.colorVariants[0].images[0] : `${API_URL}${bike.colorVariants[0].images[0]}`)
                      : '/placeholder-bike.png'
                  }
                  alt={bike.modelName}
                  className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button onClick={() => { setCurrentBike(bike); setIsModalOpen(true); }} className="p-2 bg-white/80 backdrop-blur-md rounded-lg text-gray-500 hover:text-primary shadow-sm border border-gray-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(bike.id)} className="p-2 bg-white/80 backdrop-blur-md rounded-lg text-gray-500 hover:text-red-500 shadow-sm border border-gray-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {bike.isFeatured && <span className="absolute bottom-4 left-4 text-[10px] bg-primary text-white font-black px-2 py-1 rounded">FEATURED</span>}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{bike.modelName}</h3>
                {bike.category && <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">{bike.category}</p>}
                <p className="text-gray-500 text-sm line-clamp-2 mt-2">
                  {bike.customFeatures && bike.customFeatures.map(f => f.value ? `${f.name}: ${f.value}` : f.name).join(' • ')}
                </p>
                <div className="flex gap-3 mt-4 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-2">
                  {bike.colorVariants && bike.colorVariants.map((c, i) => (
                    <span key={i} className="bg-[#f5f5f7] border border-gray-200 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      🎨 {c.name}
                    </span>
                  ))}
                  {bike.battery && <span>🔋 {bike.battery}</span>}
                  {bike.chargingTime && <span>⏱️ {bike.chargingTime}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Bike Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentBike(null); }} title={currentBike ? `Edit — ${currentBike.modelName}` : `Add Bike — ${selectedBrand.name}`}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs font-black uppercase text-primary tracking-widest">
            Brand: {selectedBrand.name} (locked)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Name *</label>
              <input name="modelName" defaultValue={currentBike?.modelName} required className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price (₹)</label>
              <input name="price" type="number" min="0" defaultValue={currentBike?.price || ''} placeholder="e.g. 85000" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
              <select name="category" defaultValue={currentBike?.category || 'No RTO / No Licence'} className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary font-bold">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-white">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Color Variants</label>
              <button type="button" onClick={addColorVariant} className="btn-outline px-3 py-1 text-xs flex items-center gap-1">
                <Plus className="w-3 h-3" /> ADD COLOR
              </button>
            </div>
            {colorVariants.map((variant, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-[#f5f5f7] border border-gray-200 rounded-xl">
                <input 
                  value={variant.name} 
                  onChange={(e) => updateColorVariant(index, e.target.value)} 
                  placeholder="Color Name (e.g. Midnight Black)" 
                  required
                  className="w-full sm:w-1/3 bg-white border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-primary text-sm font-bold" 
                />
                <div className="flex-1 w-full">
                  <input 
                    type="file" 
                    name={`colorFiles_${index}`} 
                    multiple 
                    accept="image/*"
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-black hover:file:bg-primary/90"
                  />
                  {variant.existingImages && variant.existingImages.length > 0 && (
                     <p className="text-[10px] text-primary italic mt-1">
                       {variant.existingImages.length} image(s) currently saved.
                     </p>
                  )}
                </div>
                <button type="button" onClick={() => removeColorVariant(index)} className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-[#f5f5f7] rounded-xl border border-gray-200 mt-2 sm:mt-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Charging Time</label>
              <input name="chargingTime" defaultValue={currentBike?.chargingTime} placeholder="4-5 hours" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Range</label>
              <input name="range" defaultValue={currentBike?.range} placeholder="80km" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Battery</label>
              <input name="battery" defaultValue={currentBike?.battery} placeholder="48V 20Ah" className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 mt-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">General Images (Upload & Manage)</h4>
            
            <div className="space-y-2 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] mb-2 block">Set Primary/Main Image</label>
              <input 
                type="file" 
                name="mainImage" 
                accept="image/*"
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-primary/90 transition-all cursor-pointer"
              />
              <p className="text-[10px] text-gray-400 italic">This image will be displayed as the main vehicle photo in the showroom and fleet manager.</p>
            </div>
            
            {/* Existing Image Gallery */}
            {existingImagesList.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 mb-4">
                {existingImagesList.map((imgUrl, idx) => (
                  <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-primary' : 'border-transparent'}`}>
                    <img 
                      src={imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`} 
                      className="w-full h-24 object-cover" 
                      alt={`Bike ${idx}`} 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition-opacity">
                      {idx !== 0 && (
                        <button type="button" onClick={() => setMainImage(idx)} className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-2 py-1 rounded">
                          Set Main
                        </button>
                      )}
                      <button type="button" onClick={() => removeExistingImage(idx)} className="p-1.5 bg-red-500 text-white rounded-full">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                        MAIN COVER
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Add New Images</label>
              <input 
                type="file" 
                name="images" 
                multiple 
                accept="image/*"
                className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary font-bold text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              <p className="text-xs font-bold text-gray-400 italic mt-1">
                Note: Uploading new files will append them to the end of the existing images list.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dynamic Features</label>
              <button type="button" onClick={addFeature} className="btn-outline px-3 py-1 text-xs flex items-center gap-1">
                <Plus className="w-3 h-3" /> ADD FEATURE
              </button>
            </div>
            {customFeatures.map((feat, index) => (
              <div key={index} className="flex items-center gap-3">
                <input 
                  value={feat.name} 
                  onChange={(e) => updateFeature(index, 'name', e.target.value)} 
                  placeholder="Feature (e.g. Brakes)" 
                  className="flex-1 bg-[#f5f5f7] border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-primary text-sm font-bold" 
                />
                <input 
                  value={feat.value} 
                  onChange={(e) => updateFeature(index, 'value', e.target.value)} 
                  placeholder="Value (e.g. Dual Disc)" 
                  className="flex-[2] bg-[#f5f5f7] border border-gray-200 rounded-xl py-2 px-3 outline-none focus:border-primary text-sm" 
                />
                <button type="button" onClick={() => removeFeature(index)} className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-[#f5f5f7] rounded-xl border border-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-lg font-black uppercase disabled:opacity-50 mt-6">
            {saving ? 'Saving...' : currentBike ? 'SYNC UPDATES' : 'DEPLOY TO FLEET'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BikeManager;
