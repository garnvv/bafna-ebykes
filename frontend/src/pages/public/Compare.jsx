import React, { useState, useEffect } from 'react';
import api, { API_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Zap, Battery, Info, GitCompare, ChevronDown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const Compare = () => {
  const [bikes, setBikes] = useState([]);
  const [selectedBikes, setSelectedBikes] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [openSelector, setOpenSelector] = useState(null); // which slot is showing dropdown
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const { data } = await api.get('/bikes');
        setBikes(data);

        // Auto-select bike from query param ?bike1=id
        const bike1Id = searchParams.get('bike1');
        if (bike1Id) {
          const preSelected = data.find(b => String(b.id) === String(bike1Id));
          if (preSelected) {
            setSelectedBikes([preSelected, null]);
            setOpenSelector(1); // auto-open slot 2 so user picks the comparison
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, []);

  const selectBike = (bike, index) => {
    const newSelected = [...selectedBikes];
    newSelected[index] = bike;
    setSelectedBikes(newSelected);
    setOpenSelector(null);
  };

  const clearBike = (index) => {
    const newSelected = [...selectedBikes];
    newSelected[index] = null;
    setSelectedBikes(newSelected);
    setOpenSelector(null);
  };

  const getImage = (bike) => {
    if (bike.mainImage) return bike.mainImage.startsWith('http') ? bike.mainImage : `${API_URL}${bike.mainImage}`;
    if (bike.images && bike.images[0]) return bike.images[0].startsWith('http') ? bike.images[0] : `${API_URL}${bike.images[0]}`;
    if (bike.colorVariants && bike.colorVariants[0]?.images?.[0]) {
      const img = bike.colorVariants[0].images[0];
      return img.startsWith('http') ? img : `${API_URL}${img}`;
    }
    return '/placeholder-bike.png';
  };

  const SlotPanel = ({ index }) => {
    const bike = selectedBikes[index];
    const isOpen = openSelector === index;

    return (
      <div className="flex flex-col h-full">
        {/* Slot Header */}
        <div
          className={`relative rounded-[32px] border-2 transition-all duration-300 overflow-hidden ${
            bike ? 'border-primary/30 bg-white shadow-xl' : 'border-dashed border-gray-200 bg-[#f8f8fa]'
          }`}
        >
          {/* Selected Bike Card */}
          {bike ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8"
            >
              {/* Clear button */}
              <button
                onClick={() => clearBike(index)}
                className="absolute top-5 right-5 p-2 bg-[#f5f5f7] rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-[#f5f5f7] mb-6 flex items-center justify-center">
                <img
                  src={getImage(bike)}
                  alt={bike.modelName}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Name & Price */}
              <div className="text-center mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{bike.brand}</p>
                <h2 className="text-2xl font-black text-[#1d1d1f] tracking-tight">{bike.modelName}</h2>
                <p className="text-3xl font-black text-primary mt-2">₹{Number(bike.price).toLocaleString()}</p>
              </div>

              {/* Specs */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Range', value: bike.range, icon: Zap },
                  { label: 'Battery', value: bike.battery, icon: Battery },
                  { label: 'Charging', value: bike.chargingTime, icon: Info },
                  ...(bike.topSpeed ? [{ label: 'Top Speed', value: bike.topSpeed, icon: Info }] : []),
                  ...(bike.motorPower ? [{ label: 'Motor Power', value: bike.motorPower, icon: Zap }] : []),
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between items-center py-3 px-4 bg-[#f8f8fa] rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <spec.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500">{spec.label}</span>
                    </div>
                    <span className="font-bold text-[#1d1d1f] text-sm">{spec.value || '—'}</span>
                  </div>
                ))}
              </div>

              {/* Custom features */}
              {bike.customFeatures && bike.customFeatures.filter(f => f.value).length > 0 && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Key Features</p>
                  <div className="space-y-2">
                    {bike.customFeatures.filter(f => f.value).map((feat, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">{feat.name}</span>
                        <span className="font-bold text-[#1d1d1f] text-right ml-4 text-xs">{feat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link
                to={`/bikes/${bike.id}`}
                className="mt-6 block w-full py-4 text-center bg-[#1d1d1f] text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary transition-colors"
              >
                View Full Details
              </Link>
            </motion.div>
          ) : (
            /* Empty slot placeholder */
            <div className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <GitCompare className="w-9 h-9 text-primary/50" />
              </div>
              <h3 className="text-xl font-black text-[#1d1d1f] mb-2">Bike {index + 1}</h3>
              <p className="text-gray-400 text-sm mb-6">Select a bike to compare</p>
            </div>
          )}
        </div>

        {/* Dropdown Selector */}
        <div className="mt-4 relative">
          <button
            onClick={() => setOpenSelector(isOpen ? null : index)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border font-bold text-sm transition-all ${
              isOpen
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white border-gray-200 text-[#1d1d1f] hover:border-primary/40 hover:shadow-sm'
            }`}
          >
            <span>{bike ? `Change: ${bike.modelName}` : `Select Bike ${index + 1}`}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown list */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto"
              >
                {bikes.map(b => (
                  <button
                    key={b.id}
                    onClick={() => selectBike(b, index)}
                    disabled={selectedBikes.some((s, i) => i !== index && s?.id === b.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-4 hover:bg-[#f5f5f7] transition-colors border-b border-gray-50 last:border-0 text-left disabled:opacity-30 disabled:cursor-not-allowed ${
                      selectedBikes[index]?.id === b.id ? 'bg-primary/5 text-primary' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f5f5f7] shrink-0">
                      <img src={getImage(b)} alt={b.modelName} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#1d1d1f] text-sm truncate">{b.modelName}</p>
                      <p className="text-xs text-gray-400 font-bold">{b.brand} · ₹{Number(b.price).toLocaleString()}</p>
                    </div>
                    {selectedBikes[index]?.id === b.id && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-14">
          <Link to="/bikes" className="inline-flex items-center space-x-2 text-gray-400 hover:text-primary mb-6 transition-colors font-bold text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fleet</span>
          </Link>
          <h1 className="text-6xl font-black tracking-tight text-[#1d1d1f]">
            Compare <span className="text-primary">Bikes</span>
          </h1>
          <p className="text-gray-500 mt-3 text-lg max-w-xl">
            Select two bikes side-by-side to find your perfect electric match.
          </p>
        </div>

        {loading ? (
          <div className="py-32 text-center text-gray-400">Loading bikes...</div>
        ) : (
          <>
            {/* Compare Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <SlotPanel index={0} />
              <SlotPanel index={1} />
            </div>

            {/* Decision CTA */}
            {selectedBikes[0] && selectedBikes[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 p-12 bg-[#1d1d1f] rounded-[40px] text-center"
              >
                <h2 className="text-4xl font-black text-white mb-4">Ready to Decide?</h2>
                <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                  Both machines are available for test rides at our showroom in Shirpur.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-block bg-primary text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/30"
                >
                  Book a Test Ride
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
