import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useServiceStore from '../store/serviceStore';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search, MapPin, Filter, Star, DollarSign, ChevronRight,
  Sparkles, Zap, Clock, ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'All', 'Plumbing', 'Electrical', 'Cleaning', 'Painting',
  'Carpentry', 'Gardening', 'Tutoring', 'Fitness', 'Beauty',
  'Cooking', 'Moving', 'Repair', 'Other',
];

const categoryIcons = {
  Plumbing: '🔧', Electrical: '⚡', Cleaning: '🧹', Painting: '🎨',
  Carpentry: '🪚', Gardening: '🌱', Tutoring: '📚', Fitness: '💪',
  Beauty: '💇', Cooking: '👨‍🍳', Moving: '📦', Repair: '🛠️', Other: '📌',
};

const HomePage = () => {
  const { services, loading, pagination, fetchServices, filters, setFilters } = useServiceStore();
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Detect user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => console.log('Location access denied')
      );
    }
    fetchServices();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = { search: searchInput };
    if (activeCategory !== 'All') params.category = activeCategory;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (userLocation) {
      params.latitude = userLocation.latitude;
      params.longitude = userLocation.longitude;
      if (filters.maxDistance) params.maxDistance = filters.maxDistance;
    }
    fetchServices(params);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const params = cat !== 'All' ? { category: cat } : {};
    if (searchInput) params.search = searchInput;
    fetchServices(params);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-600/20 to-transparent rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={14} className="text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">Find trusted local services</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Your Local Services
            <span className="gradient-text block">Marketplace</span>
          </h1>
          <p className="text-lg text-dark-300 mb-10 max-w-2xl mx-auto">
            Discover skilled professionals near you. From plumbing to tutoring — get things done with ServeConnect.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="flex items-center glass rounded-2xl overflow-hidden">
              <div className="flex items-center flex-1 px-5">
                <Search size={20} className="text-dark-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-transparent border-none outline-none px-4 py-4 text-white placeholder-dark-400"
                />
              </div>
              {userLocation && (
                <div className="hidden sm:flex items-center text-dark-400 pr-3">
                  <MapPin size={16} className="text-accent-400" />
                  <span className="text-xs ml-1">Nearby</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="p-4 text-dark-400 hover:text-primary-400 transition-colors"
              >
                <Filter size={20} />
              </button>
              <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-4 font-medium transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="card max-w-2xl mx-auto mt-4 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Min Price</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ minPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Max Price</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="10000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ maxPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Distance (meters)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="10000"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({ maxDistance: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="page-container">
        <div className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'bg-dark-800/60 text-dark-300 hover:bg-dark-700 border border-dark-700/50'
              }`}
            >
              {cat !== 'All' && <span>{categoryIcons[cat]}</span>}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="page-container pt-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {activeCategory === 'All' ? 'All Services' : activeCategory}
            <span className="text-dark-400 text-base font-normal ml-2">
              ({pagination.total} found)
            </span>
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading services..." />
        ) : services.length === 0 ? (
          <div className="card text-center py-16">
            <Zap size={48} className="text-dark-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-300 mb-2">No services found</h3>
            <p className="text-dark-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service._id}
                to={`/services/${service._id}`}
                className="card group hover:border-primary-500/30 hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{categoryIcons[service.category] || '📌'}</span>
                  <span className={`badge ${service.availability ? 'badge-accent' : 'badge-danger'}`}>
                    {service.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                  {service.title}
                </h3>
                <p className="text-dark-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-1">
                    <DollarSign size={16} className="text-accent-400" />
                    <span className="text-accent-300 font-bold">₹{service.price}</span>
                    <span className="text-dark-500 text-sm">
                      /{service.priceUnit === 'per_hour' ? 'hr' : service.priceUnit === 'per_session' ? 'session' : 'fixed'}
                    </span>
                  </div>
                  <div className="flex items-center text-dark-400 text-sm">
                    {service.provider && (
                      <span>{service.provider.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-primary-400 text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Details</span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="page-container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-dark-400">Get connected with local service providers in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: 'Search', desc: 'Find services near your location with smart filters', color: 'primary' },
            { icon: Zap, title: 'Request', desc: 'Send a request and nearby providers get notified instantly', color: 'accent' },
            { icon: Clock, title: 'Connect', desc: 'Chat in real-time, track requests, and get things done', color: 'primary' },
          ].map((step, i) => (
            <div key={i} className="card text-center group hover:border-primary-500/30 transition-all">
              <div className={`w-14 h-14 bg-${step.color}-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon size={24} className={`text-${step.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-dark-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
