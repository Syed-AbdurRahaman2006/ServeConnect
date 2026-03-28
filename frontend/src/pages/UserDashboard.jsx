import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useRequestStore from '../store/requestStore';
import useServiceStore from '../store/serviceStore';
import toast from 'react-hot-toast';
import { 
  Search, Clock, Star, ArrowRight, ArrowLeft, X,
  Droplets, Settings, Wrench, Scissors, PaintRoller, Home, MapPin,
  Sparkles, TrendingUp, Shield, CheckCircle2, ChevronRight, Zap, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import LocationModal from '../components/LocationModal';

// Gradient backgrounds for category cards
const categoryGradients = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-orange-500 to-amber-400',
  'from-pink-500 to-rose-400',
  'from-emerald-500 to-teal-400',
  'from-indigo-500 to-blue-400',
];

// Background image URLs for category cards (reliable Unsplash)
const categoryImages = {
  Cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  Repair: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
  Electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
  Beauty: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  Painting: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
  Plumbing: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
};

const UserDashboard = () => {
  const { user } = useAuthStore();
  const { requests, fetchRequests } = useRequestStore();
  const { services, fetchServices, loading: servicesLoading } = useServiceStore();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardServices, setDashboardServices] = useState([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchRequests();
    
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    // Check for location on first load
    const savedLoc = localStorage.getItem('userLocation');
    if (!savedLoc) {
      setTimeout(() => setLocationModalOpen(true), 1000);
    }

    fetchServices({ limit: 6 }).then(() => {});
  }, []);

  useEffect(() => {
    if (services && services.length > 0 && !selectedCategory) {
      setDashboardServices(services.filter(s => s.availability).slice(0, 6));
    }
  }, [services, selectedCategory]);

  const activeRequests = requests.filter((r) => ['CREATED', 'ACCEPTED'].includes(r.status));

  const categories = [
    { title: "Cleaning", info: "Professional deep cleaning", icon: Droplets, gradient: categoryGradients[0], emoji: "🧹" },
    { title: "Repair", info: "Quick fixes & maintenance", icon: Settings, gradient: categoryGradients[1], emoji: "🔧" },
    { title: "Electrician", info: "Certified professionals", icon: Wrench, gradient: categoryGradients[2], emoji: "⚡" },
    { title: "Beauty", info: "Premium salon at home", icon: Scissors, gradient: categoryGradients[3], emoji: "💇" },
    { title: "Painting", info: "Transform your space", icon: PaintRoller, gradient: categoryGradients[4], emoji: "🎨" },
    { title: "Plumbing", info: "Expert plumbing care", icon: Home, gradient: categoryGradients[5], emoji: "🔩" },
  ];

  const handleCategoryClick = (categoryTitle) => {
    setSelectedCategory(categoryTitle);
    const savedLoc = localStorage.getItem('userLocation');
    let params = { category: categoryTitle };
    if (savedLoc) {
      const { lat, lng } = JSON.parse(savedLoc);
      params.lat = lat;
      params.lng = lng;
    }
    fetchServices(params);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if(!searchQuery.trim()) return;
      setSelectedCategory('Search: ' + searchQuery);
      const savedLoc = localStorage.getItem('userLocation');
      let params = { search: searchQuery };
      if (savedLoc) {
        const { lat, lng } = JSON.parse(savedLoc);
        params.lat = lat;
        params.lng = lng;
      }
      fetchServices(params);
    }
  };

  // ─────────────── CATEGORY RESULTS VIEW ───────────────
  const renderCategoryResults = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="col-span-12"
    >
      {/* Back navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="w-11 h-11 bg-white border border-surface-200 rounded-2xl flex items-center justify-center hover:bg-surface-50 hover:border-indigo-200 hover:shadow-md transition-all group"
        >
          <ArrowLeft size={20} className="text-surface-600 group-hover:text-indigo-600 transition-colors" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-surface-900">{selectedCategory} Providers</h2>
          <p className="text-surface-500 text-sm font-medium">Showing results near you</p>
        </div>
      </div>

      {servicesLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-surface-500 font-semibold text-lg">Finding the best providers...</p>
          <p className="text-surface-400 text-sm mt-1">This won't take long</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-surface-100 to-surface-200 text-surface-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-black text-surface-900 mb-3">No providers found</h3>
          <p className="text-surface-500 font-medium mb-8 max-w-sm mx-auto">We're expanding to your area soon. Try another service or check back later.</p>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="px-8 py-3.5 bg-surface-900 text-white font-bold rounded-2xl hover:bg-surface-800 transition-all shadow-sm"
          >
            ← Browse Categories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc, index) => (
            <motion.div 
              key={svc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-surface-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 group cursor-pointer" 
              onClick={() => navigate(`/services/${svc._id}`)}
            >
              <div className="h-44 bg-gradient-to-br from-surface-100 to-surface-200 relative overflow-hidden">
                <img 
                  src={categoryImages[svc.category] || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop`} 
                  alt={svc.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <Star size={14} className="text-amber-500" fill="currentColor"/>
                  <span className="text-xs font-black text-surface-900">4.9</span>
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="text-xs font-black text-indigo-600">₹{svc.price}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-surface-900 mb-1 line-clamp-1">{svc.title}</h3>
                <p className="text-surface-500 text-sm mb-4 line-clamp-2 leading-relaxed">{svc.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {svc.provider?.name?.charAt(0) || svc.providerId?.name?.charAt(0) || 'P'}
                    </div>
                    <span className="text-sm font-semibold text-surface-700">{svc.provider?.name || svc.providerId?.name}</span>
                  </div>
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // ─────────────── MAIN DISCOVERY VIEW ───────────────
  const renderDiscovery = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="col-span-12"
    >
      {/* ── Hero Welcome Section ── */}
      <div className="relative mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="text-2xl">👋</span>
              <span className="text-surface-500 font-semibold text-lg">{greeting},</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-surface-900 leading-[1.1] tracking-tight"
            >
              {user?.name ? user.name.split(' ')[0] : 'there'}! <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">What do you need today?</span>
            </motion.h1>
          </div>
          
          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            {activeRequests.length > 0 && (
              <button 
                onClick={() => navigate('/chat')}
                className="flex items-center gap-3 bg-white border border-indigo-200 hover:border-indigo-300 rounded-2xl px-5 py-3 hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Clock size={18} className="text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Active</p>
                  <p className="text-surface-900 font-black text-lg leading-none">{activeRequests.length} Booking{activeRequests.length > 1 ? 's' : ''}</p>
                </div>
                <ChevronRight size={18} className="text-surface-400 group-hover:text-indigo-600 transition-colors ml-2" />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
      >
        <div className="bg-white rounded-[1.25rem] shadow-lg shadow-surface-200/50 border border-surface-200/80 p-2 flex items-center focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 focus-within:shadow-xl focus-within:shadow-indigo-100/30 transition-all duration-300 max-w-3xl">
          <div className="pl-4 pr-3">
            <Search size={22} className="text-surface-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search for any service — cleaning, repair, painting..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-transparent border-none outline-none text-surface-900 text-base placeholder-surface-400 py-3 font-medium"
          />
          <button 
            onClick={handleSearch} 
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold px-7 py-3 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all hidden sm:flex items-center gap-2 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 shrink-0"
          >
            <Search size={16} />
            <span>Search</span>
          </button>
        </div>
      </motion.div>

      {/* ── Service Categories ── */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-surface-900 tracking-tight">Popular Services</h2>
              <p className="text-surface-500 text-sm font-medium">Book trusted professionals instantly</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onClick={() => handleCategoryClick(cat.title)}
              className="relative bg-white border border-surface-200 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-xl hover:border-transparent hover:-translate-y-2 transition-all duration-300 group overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </div>
                <h3 className="font-bold text-surface-900 group-hover:text-white leading-tight mb-0.5 text-sm transition-colors duration-300">{cat.title}</h3>
                <p className="text-xs font-medium text-surface-500 group-hover:text-white/80 transition-colors duration-300 hidden sm:block">{cat.info}</p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-3 right-3 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <ArrowRight size={14} className="text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Featured Services / Near You ── */}
      {dashboardServices.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-surface-900 tracking-tight">Available Near You</h2>
                <p className="text-surface-500 text-sm font-medium">Top-rated services in your area</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboardServices.map((svc, index) => (
              <motion.div 
                key={svc._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                onClick={() => navigate(`/services/${svc._id}`)} 
                className="group bg-white border border-surface-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-200 hover:-translate-y-1.5 transition-all duration-400 cursor-pointer"
              >
                {/* Image area */}
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={categoryImages[svc.category] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop'} 
                    alt={svc.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                      <Star size={13} className="text-amber-500" fill="currentColor"/>
                      <span className="text-xs font-black text-surface-900">4.9</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md">
                      <span className="text-xs font-black text-emerald-600">✓ Available</span>
                    </div>
                  </div>
                  
                  {/* Price tag at bottom of image */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-xl shadow-lg">
                      <span className="text-white font-black text-sm">₹{svc.price}</span>
                      <span className="text-white/70 text-xs font-medium ml-1">/ {svc.priceUnit?.replace('_','') || 'session'}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-100">{svc.category}</span>
                  </div>
                  <h3 className="font-bold text-lg text-surface-900 mb-1.5 line-clamp-1 group-hover:text-indigo-700 transition-colors">{svc.title}</h3>
                  <p className="text-surface-500 text-sm line-clamp-2 leading-relaxed mb-4">{svc.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {svc.provider?.name?.charAt(0) || svc.providerId?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-surface-900 block leading-tight">{svc.provider?.name || svc.providerId?.name}</span>
                        <span className="text-xs text-surface-400 font-medium">Verified Pro</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Book</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Trust Indicators ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {[
          { icon: Shield, title: "Verified Providers", desc: "Background checked", gradient: "from-emerald-500 to-teal-500" },
          { icon: Zap, title: "Instant Matching", desc: "Get matched in seconds", gradient: "from-amber-500 to-orange-500" },
          { icon: Heart, title: "Satisfaction Guaranteed", desc: "100% money-back", gradient: "from-pink-500 to-rose-500" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 bg-white border border-surface-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
              <item.icon size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-surface-900 text-sm">{item.title}</h4>
              <p className="text-surface-500 text-xs font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-surface-50 pt-4 pb-20 font-sans selection:bg-indigo-500/30">
      <LocationModal 
        isOpen={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)} 
        onSave={(coords) => {
          if (selectedCategory && !selectedCategory.startsWith("Search:")) {
            handleCategoryClick(selectedCategory);
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {selectedCategory ? renderCategoryResults() : renderDiscovery()}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
