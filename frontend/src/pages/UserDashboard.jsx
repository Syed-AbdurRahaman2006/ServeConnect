import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useRequestStore from '../store/requestStore';
import useServiceStore from '../store/serviceStore';
import toast from 'react-hot-toast';
import { 
  Search, Clock, Star, ArrowRight, ArrowLeft, X, ClipboardList, User, MessageSquare,
  Droplets, Settings, Wrench, Scissors, PaintRoller, Home, MapPin,
  Sparkles, TrendingUp, Shield, CheckCircle2, ChevronRight, Zap, Heart, AlertCircle, ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import LocationModal from '../components/LocationModal';
import LocationFetchButton from '../components/LocationFetchButton';

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
  const { requests, fetchRequests, updateStatus } = useRequestStore();
  const { services, fetchServices, loading: servicesLoading } = useServiceStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [viewMode, setViewMode] = useState('discovery');
  
  useEffect(() => {
    if (location.hash === '#bookings') {
      setViewMode('bookings');
      setSelectedCategory(null);
    } else {
      setViewMode('discovery');
    }
  }, [location.hash]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardServices, setDashboardServices] = useState([]);
  const [greeting, setGreeting] = useState('');
  
  // Completion & Feedback Modals
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [completingRequest, setCompletingRequest] = useState(false);

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
      fetchServices({ limit: 6 }).then(() => {});
    } else {
      const { lat, lng } = JSON.parse(savedLoc);
      fetchServices({ limit: 6, latitude: lat, longitude: lng }).then(() => {});
    }
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
      params.latitude = lat;
      params.longitude = lng;
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
        params.latitude = lat;
        params.longitude = lng;
      }
      fetchServices(params);
    }
  };

  // Reset to discovery view — clears filters and re-fetches all services
  const clearCategoryAndRefresh = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    
    const savedLoc = localStorage.getItem('userLocation');
    let params = { limit: 6 };
    if (savedLoc) {
      const { lat, lng } = JSON.parse(savedLoc);
      params.latitude = lat;
      params.longitude = lng;
    }
    fetchServices(params);
  };

  // Handle completion request from user
  const handleCompleteRequest = (req) => {
    setSelectedRequest(req);
    setCompletionModalOpen(true);
  };

  // Confirm completion and open feedback modal
  const confirmCompletion = async () => {
    setCompletionModalOpen(false);
    setFeedbackModalOpen(true);
  };

  // Submit feedback and complete request
  const submitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    
    setCompletingRequest(true);
    try {
      // Send rating and feedback as separate fields in the request body
      await updateStatus(
        selectedRequest._id, 
        'COMPLETED', 
        `User marked as complete. Rating: ${rating}/5. Feedback: ${feedback || 'No feedback provided'}`,
        { rating, feedback }
      );
      toast.success('Service marked as completed! Thank you for your feedback.');
      setFeedbackModalOpen(false);
      setRating(0);
      setFeedback('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to complete request');
    } finally {
      setCompletingRequest(false);
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
          onClick={clearCategoryAndRefresh}
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
            onClick={clearCategoryAndRefresh}
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
              className="bg-white border border-surface-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-200 hover:-translate-y-1.5 transition-all duration-400 group cursor-pointer" 
              onClick={() => navigate(`/services/${svc._id}`)}
            >
              {/* ── Image Hero (~75%) ── */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={svc.imageUrl || categoryImages[svc.category] || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop`} 
                  alt={svc.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Cinematic overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"></div>
                
                {/* Top floating badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                    <Star size={13} className="text-amber-500" fill="currentColor"/>
                    <span className="text-xs font-black text-surface-900">4.9</span>
                  </div>
                  <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
                    <span className="text-xs font-black text-emerald-600">✓ Available</span>
                  </div>
                </div>

                {/* Bottom overlay: Title + Price */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1 block">{svc.category}</span>
                  <h3 className="font-black text-xl text-white mb-2 line-clamp-1 drop-shadow-lg">{svc.title}</h3>
                  <p className="text-white/60 text-sm line-clamp-1 mb-3 font-medium">{svc.description}</p>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 rounded-xl shadow-lg inline-flex items-baseline gap-1">
                    <span className="text-white font-black text-sm">₹{svc.price}</span>
                    <span className="text-white/70 text-xs font-medium">/ {svc.priceUnit?.replace('_','') || 'session'}</span>
                  </div>
                </div>
              </div>

              {/* ── Compact Info Bar (~25%) ── */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {svc.provider?.name?.charAt(0) || svc.providerId?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-surface-900 block leading-tight">{svc.provider?.name || svc.providerId?.name}</span>
                    <span className="text-xs text-surface-400 font-medium">Verified Pro</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5">
                  <span>View</span>
                  <ArrowRight size={16} />
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
                onClick={() => navigate('/dashboard#bookings')}
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
                {/* ── Image Hero (~75%) ── */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={svc.imageUrl || categoryImages[svc.category] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop'} 
                    alt={svc.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {/* Cinematic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"></div>
                  
                  {/* Top floating badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                      <Star size={13} className="text-amber-500" fill="currentColor"/>
                      <span className="text-xs font-black text-surface-900">4.9</span>
                    </div>
                    <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
                      <span className="text-xs font-black text-emerald-600">✓ Available</span>
                    </div>
                  </div>

                  {/* Bottom overlay: Title + Price */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1 block">{svc.category}</span>
                    <h3 className="font-black text-xl text-white mb-2 line-clamp-1 drop-shadow-lg">{svc.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-1 mb-3 font-medium">{svc.description}</p>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 rounded-xl shadow-lg inline-flex items-baseline gap-1">
                      <span className="text-white font-black text-sm">₹{svc.price}</span>
                      <span className="text-white/70 text-xs font-medium">/ {svc.priceUnit?.replace('_','') || 'session'}</span>
                    </div>
                  </div>
                </div>

                {/* ── Compact Info Bar (~25%) ── */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {svc.provider?.name?.charAt(0) || svc.providerId?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-surface-900 block leading-tight">{svc.provider?.name || svc.providerId?.name}</span>
                      <span className="text-xs text-surface-400 font-medium">Verified Pro</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5">
                    <span>Book</span>
                    <ArrowRight size={16} />
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

  // ─────────────── BOOKINGS VIEW ───────────────
  const renderBookings = () => {
    const activeBookings = requests.filter(r => ['CREATED', 'ACCEPTED'].includes(r.status));
    const completedBookings = requests.filter(r => r.status === 'COMPLETED');
    const cancelledBookings = requests.filter(r => ['CANCELLED', 'REJECTED'].includes(r.status));

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="col-span-12"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="w-10 h-10 bg-white border border-surface-200 rounded-xl flex items-center justify-center hover:bg-surface-50 hover:border-indigo-200 transition-all group"
              >
                <ArrowLeft size={18} className="text-surface-600 group-hover:text-indigo-600 transition-colors" />
              </button>
              <h2 className="text-3xl font-black text-surface-900 tracking-tight">My Bookings</h2>
            </div>
            <p className="text-surface-500 font-medium ml-[52px]">Track and manage all your service requests</p>
          </div>
          
          {/* Stats Summary */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-surface-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-surface-700">{activeBookings.length} Active</span>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-sm font-bold text-surface-700">{completedBookings.length} Done</span>
            </div>
          </div>
        </div>

        {/* No Active Bookings - Empty State */}
        {activeBookings.length === 0 && requests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-3xl p-12 text-center shadow-lg shadow-indigo-100/50 mb-8"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ClipboardList size={48} className="text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-surface-900 mb-3">No Active Bookings</h3>
            <p className="text-surface-600 font-medium mb-8 max-w-md mx-auto text-lg">
              You don't have any upcoming services scheduled. Discover amazing local professionals and book your next service!
            </p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-10 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 inline-flex items-center gap-3 text-lg"
            >
              <Sparkles size={22} />
              Book a Service Now
            </button>
          </motion.div>
        )}

        {requests.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-surface-200 rounded-3xl p-16 text-center shadow-sm max-w-2xl mx-auto"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ClipboardList size={40} className="text-indigo-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-surface-900 mb-3">No Bookings Yet</h3>
            <p className="text-surface-500 font-medium mb-8 max-w-md mx-auto">Start exploring amazing services and book your first professional today!</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-500/20 inline-flex items-center gap-2"
            >
              <Sparkles size={18} />
              Discover Services
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-surface-900">Active Bookings</h3>
                    <p className="text-surface-500 text-sm font-medium">{activeBookings.length} in progress</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {activeBookings.map((req, index) => (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      {/* Card Header with Image */}
                      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-lg ${
                            req.status === 'ACCEPTED' 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-amber-500 text-white animate-pulse'
                          }`}>
                            {req.status === 'ACCEPTED' ? '✓ In Progress' : '⏳ Finding Provider'}
                          </span>
                          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-black text-surface-900 shadow-lg">
                            {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <Wrench size={24} className="text-indigo-600" />
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h4 className="text-lg font-black text-surface-900 mb-2 line-clamp-1">
                          {req.serviceId?.title || 'Service Request'}
                        </h4>
                        <p className="text-surface-500 text-sm mb-4 line-clamp-2">
                          {req.description || 'No additional details provided'}
                        </p>

                        {/* Provider Info or Waiting State */}
                        {req.providerId ? (
                          <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                              {req.providerId.name?.charAt(0) || 'P'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-surface-900 truncate">{req.providerId.name}</p>
                              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                Your Service Provider
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                              <Clock size={20} className="text-white animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-surface-900">Searching for providers...</p>
                              <p className="text-xs text-amber-600 font-bold">We'll notify you when someone accepts</p>
                            </div>
                          </div>
                        )}

                        {/* Requester Info (You) */}
                        <div className="flex items-center gap-3 mb-4 p-3 bg-surface-50 rounded-xl border border-surface-200">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                            {user?.name?.charAt(0) || 'Y'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-surface-900 truncate">{user?.name || 'You'}</p>
                            <p className="text-xs text-surface-500 font-medium">Requester</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {req.providerId ? (
                            <>
                              <button 
                                onClick={() => navigate(`/chat?requestId=${req._id}`)}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
                              >
                                <MessageSquare size={16} />
                                Chat
                              </button>
                              {req.status === 'ACCEPTED' && (
                                <>
                                  {/* Check if completion is pending confirmation */}
                                  {req.completionConfirmation?.userConfirmed && !req.completionConfirmation?.providerConfirmed ? (
                                    <button 
                                      className="flex-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-300 px-4 py-3 rounded-xl text-sm font-bold cursor-default flex items-center justify-center gap-2"
                                      disabled
                                    >
                                      <Clock size={16} className="animate-pulse" />
                                      Awaiting Provider
                                    </button>
                                  ) : req.completionConfirmation?.providerConfirmed && !req.completionConfirmation?.userConfirmed ? (
                                    <button 
                                      onClick={() => handleCompleteRequest(req)}
                                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 animate-pulse"
                                    >
                                      <AlertCircle size={16} />
                                      Confirm Complete
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleCompleteRequest(req)}
                                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
                                    >
                                      <CheckCircle2 size={16} />
                                      Complete
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <button 
                              className="flex-1 bg-surface-100 text-surface-500 px-4 py-3 rounded-xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
                              disabled
                            >
                              <Clock size={16} className="animate-pulse" />
                              Waiting for Provider
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Bookings */}
            {completedBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-surface-900">Past Bookings</h3>
                    <p className="text-surface-500 text-sm font-medium">{completedBookings.length} completed services</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedBookings.map((req, index) => (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-emerald-200 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-100/50 hover:border-emerald-300 transition-all group"
                    >
                      {/* Service Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <CheckCircle2 size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-surface-900 mb-1 line-clamp-1">{req.serviceId?.title}</h4>
                          <p className="text-xs text-surface-500 font-medium">
                            {new Date(req.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Provider Info */}
                      {req.providerId && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-surface-50 rounded-xl border border-surface-200">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {req.providerId.name?.charAt(0) || 'P'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-surface-500 font-medium">Provider</p>
                            <p className="text-sm font-bold text-surface-900 truncate">{req.providerId.name}</p>
                          </div>
                        </div>
                      )}

                      {/* Rating Display */}
                      {req.rating ? (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold text-amber-700 mb-2">Your Rating</p>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={18}
                                className={star <= req.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}
                              />
                            ))}
                            <span className="ml-2 text-sm font-black text-amber-700">{req.rating}.0</span>
                          </div>
                          {req.feedback && (
                            <p className="text-xs text-surface-600 italic line-clamp-2">"{req.feedback}"</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-surface-50 border border-surface-200 rounded-xl p-3 mb-3 text-center">
                          <p className="text-xs text-surface-400 font-medium">No rating provided</p>
                        </div>
                      )}

                      {/* Price */}
                      {req.serviceId?.price && (
                        <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                          <span className="text-xs font-bold text-surface-500">Amount Paid</span>
                          <span className="text-lg font-black text-emerald-600">₹{req.serviceId.price}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Bookings */}
            {cancelledBookings.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
                    <X size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-surface-900">Cancelled</h3>
                    <p className="text-surface-500 text-sm font-medium">{cancelledBookings.length} cancelled</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cancelledBookings.map((req, index) => (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-surface-200 rounded-2xl p-5 opacity-60 hover:opacity-100 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                          <X size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-surface-900 text-sm mb-1 line-clamp-1">{req.serviceId?.title}</h4>
                          <p className="text-xs text-surface-500 font-medium">
                            {new Date(req.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-50 pt-4 pb-20 font-sans selection:bg-indigo-500/30">
      <LocationModal 
        isOpen={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)} 
        onSave={(coords) => {
          if (selectedCategory && !selectedCategory.startsWith('Search:')) {
            handleCategoryClick(selectedCategory);
          } else if (selectedCategory) {
            const savedLoc = localStorage.getItem('userLocation');
            if (savedLoc) {
              const { lat, lng } = JSON.parse(savedLoc);
              fetchServices({ search: searchQuery, latitude: lat, longitude: lng });
            }
          } else {
            const savedLoc = localStorage.getItem('userLocation');
            if (savedLoc) {
              const { lat, lng } = JSON.parse(savedLoc);
              fetchServices({ limit: 6, latitude: lat, longitude: lng });
            }
          }
        }}
      />

      {/* Completion Confirmation Modal */}
      <AnimatePresence>
        {completionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCompletionModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-surface-900 mb-2">Mark as Complete?</h3>
                <p className="text-surface-600 font-medium">
                  Are you sure the service has been completed to your satisfaction?
                </p>
              </div>

              <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                    <Wrench size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-surface-900 text-sm truncate">{selectedRequest?.serviceId?.title}</p>
                    <p className="text-xs text-surface-500 font-medium">Provider: {selectedRequest?.providerId?.name}</p>
                  </div>
                </div>
                <p className="text-xs text-surface-600 leading-relaxed">
                  The provider will be notified and asked to confirm completion. You'll then be able to leave a review.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCompletionModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-surface-100 text-surface-700 rounded-xl font-bold hover:bg-surface-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCompletion}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Yes, Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !completingRequest && setFeedbackModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-surface-900 mb-2">Rate Your Experience</h3>
                <p className="text-surface-600 font-medium">
                  How was your experience with {selectedRequest?.providerId?.name}?
                </p>
              </div>

              {/* Service Info */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                    {selectedRequest?.providerId?.name?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-surface-900 truncate">{selectedRequest?.serviceId?.title}</p>
                    <p className="text-sm text-surface-600 font-medium">{selectedRequest?.providerId?.name}</p>
                  </div>
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-surface-700 mb-3 text-center">Your Rating</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={40}
                        className={`transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-surface-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center mt-2 text-sm font-bold text-amber-600">
                    {rating === 5 ? '⭐ Excellent!' : rating === 4 ? '👍 Great!' : rating === 3 ? '😊 Good' : rating === 2 ? '😐 Fair' : '😞 Poor'}
                  </p>
                )}
              </div>

              {/* Feedback Text */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-surface-700 mb-2">Additional Feedback (Optional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience with this service..."
                  rows={4}
                  className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 placeholder-surface-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFeedbackModalOpen(false);
                    setRating(0);
                    setFeedback('');
                  }}
                  disabled={completingRequest}
                  className="flex-1 px-6 py-3 bg-surface-100 text-surface-700 rounded-xl font-bold hover:bg-surface-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={rating === 0 || completingRequest}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {completingRequest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ThumbsUp size={18} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LocationModal 
        isOpen={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)} 
        onSave={(coords) => {
          if (selectedCategory && !selectedCategory.startsWith("Search:")) {
            handleCategoryClick(selectedCategory);
          } else if (selectedCategory && selectedCategory.startsWith("Search:")) {
            const searchQ = selectedCategory.replace('Search: ', '');
            fetchServices({ search: searchQ, latitude: coords.lat, longitude: coords.lng });
          } else {
            fetchServices({ limit: 6, latitude: coords.lat, longitude: coords.lng });
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {viewMode === 'bookings' ? renderBookings() : (selectedCategory ? renderCategoryResults() : renderDiscovery())}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
