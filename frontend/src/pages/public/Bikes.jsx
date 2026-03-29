import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL } from '../../services/api';
import { Search, SlidersHorizontal, Battery, Zap, Timer, Gauge, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Bikes = () => {
  const [bikes, setBikes] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState(250000);
  const [selectedBrand, setSelectedBrand] = useState('All');

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const { data } = await api.get('/bikes');
        setBikes(data);
        setFilteredBikes(data);
      } catch (error) {
        console.error('Failed to fetch bikes', error);
      }
    };
    fetchBikes();
  }, []);

  useEffect(() => {
    const results = bikes.filter(bike =>
      bike.modelName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      bike.price <= priceRange &&
      (selectedBrand === 'All' || bike.brand === selectedBrand)
    );
    setFilteredBikes(results);
  }, [searchTerm, priceRange, selectedBrand, bikes]);

  const uniqueBrands = ['All', ...new Set(bikes.map(b => b.brand))];

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-black uppercase mb-6 tracking-tight text-[#1d1d1f]">Our Fleet</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">Precision engineered electric bikes for every lifestyle. From urban commuting to off-road performance.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Filters */}
        <aside className="w-full lg:w-64 space-y-10">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="font-bold uppercase tracking-widest text-sm text-[#1d1d1f]">Search</h3>
            </div>
            <input
              type="text"
              placeholder="Model name..."
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:border-primary outline-none transition-all shadow-sm text-[#1d1d1f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-6">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h3 className="font-bold uppercase tracking-widest text-sm text-[#1d1d1f]">Price Range</h3>
            </div>
            <input
              type="range"
              min="0"
              max="250000"
              step="5000"
              className="w-full accent-primary bg-gray-200 h-2 rounded-lg appearance-none cursor-pointer"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            />
            <div className="flex justify-between mt-4 text-sm font-bold text-[#1d1d1f]">
              <span>₹0</span>
              <span className="text-primary">₹{(priceRange / 1000).toFixed(0)}k</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-bold uppercase tracking-widest text-sm text-[#1d1d1f]">Brand</h3>
            </div>
            <div className="space-y-2">
              {uniqueBrands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-semibold ${selectedBrand === brand ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Bike Grid */}
        <div className="flex-1">
          {filteredBikes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredBikes.map((bike, i) => (
                <motion.div
                  key={bike.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="card group flex flex-col h-full bg-white border-0 p-2 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all rounded-[32px]"
                >
                  <div className="w-full aspect-video relative overflow-hidden bg-white rounded-3xl flex items-center justify-center p-0 mb-2">
                    <img
                      src={
                        bike.mainImage ? (bike.mainImage.startsWith('http') ? bike.mainImage : `${API_URL}${bike.mainImage}`)
                          : (bike.images && bike.images.length > 0) ? (bike.images[0].startsWith('http') ? bike.images[0] : `${API_URL}${bike.images[0]}`)
                            : (bike.colorVariants && bike.colorVariants.length > 0 && bike.colorVariants[0].images && bike.colorVariants[0].images.length > 0) ? (bike.colorVariants[0].images[0].startsWith('http') ? bike.colorVariants[0].images[0] : `${API_URL}${bike.colorVariants[0].images[0]}`)
                              : '/placeholder-bike.png'
                      }
                      alt={bike.modelName}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">{bike.modelName}</h3>
                        <span className="text-primary font-black text-lg">₹{Number(bike.price).toLocaleString()}</span>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center text-sm font-medium text-gray-500">
                          <Battery className="w-4 h-4 mr-3 text-[#1d1d1f]" />
                          <span>{bike.range} Range</span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-500">
                          <Zap className="w-4 h-4 mr-3 text-[#1d1d1f]" />
                          <span>{bike.battery} Battery</span>
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-500">
                          <Timer className="w-4 h-4 mr-3 text-[#1d1d1f]" />
                          <span>{bike.chargingTime} Charging</span>
                        </div>
                        {bike.topSpeed && (
                          <div className="flex items-center text-sm font-medium text-gray-500">
                            <Gauge className="w-4 h-4 mr-3 text-[#1d1d1f]" />
                            <span>{bike.topSpeed} Speed</span>
                          </div>
                        )}
                        {bike.motorPower && (
                          <div className="flex items-center text-sm font-medium text-gray-500">
                            <Activity className="w-4 h-4 mr-3 text-[#1d1d1f]" />
                            <span>{bike.motorPower} Motor</span>
                          </div>
                        )}
                        {bike.customFeatures && bike.customFeatures.filter(f => f.value).slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center text-sm font-medium text-gray-500">
                            <div className="w-4 h-4 mr-3 rounded-full bg-primary/20 flex items-center justify-center text-[#1d1d1f] text-[8px] font-black">✓</div>
                            <span><span className="text-[#1d1d1f] font-bold">{feat.name}:</span> {feat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/bikes/${bike.id}`} className="btn-primary flex-1 text-center text-sm py-3.5">
                        Explore Details
                      </Link>
                      <Link to={`/compare?bike1=${bike.id}`} className="btn-outline flex-none px-4 py-3.5 text-sm" title="Compare this bike">
                        Compare
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 italic text-lg">No bikes found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bikes;
