import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LocationModal from './LocationModal';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  Menu, X, Home, Search, MessageSquare, LayoutDashboard,
  Shield, LogOut, User, Zap, MapPin, ShoppingCart
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationName, setLocationName] = useState('Update Location');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateLoc = () => {
      const stored = localStorage.getItem('locationName');
      if (stored) setLocationName(stored);
    };
    updateLoc();
    window.addEventListener('storage', updateLoc);
    return () => window.removeEventListener('storage', updateLoc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLinks = {
    USER: [
      { to: '/chat', label: 'Messages', icon: MessageSquare },
      { to: '/dashboard', label: 'Profile', icon: User },
    ],
    PROVIDER: [
      { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/chat', label: 'Messages', icon: MessageSquare },
    ],
    ADMIN: [
      { to: '/', label: 'Home', icon: Home },
      { to: '/admin', label: 'Admin Panel', icon: Shield },
    ],
  };

  const unauthLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/#services', label: 'Services', icon: Search },
    { to: '/#how-it-works', label: 'How It Works', icon: Zap },
    { to: '/#contact', label: 'Contact', icon: MessageSquare },
  ];

  const links = isAuthenticated ? roleLinks[user?.role] || roleLinks.USER : unauthLinks;

  return (
    <>
    <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    <nav className="sticky top-0 z-50 bg-white/40 backdrop-blur-2xl border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={isAuthenticated ? (user?.role === 'PROVIDER' ? '/provider/dashboard' : user?.role === 'ADMIN' ? '/admin' : '/dashboard') : '/'} className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-surface-900 to-surface-700 hidden sm:block">
              ServeConnect
            </span>
          </Link>

          {/* Search & Location (USER & PROVIDER) */}
          {isAuthenticated && (user?.role === 'USER' || user?.role === 'PROVIDER') && (
            <div className={`hidden lg:flex flex-1 ${user?.role === 'USER' ? 'max-w-2xl' : 'max-w-[200px]'} mx-8 items-center bg-surface-100 rounded-full border border-surface-200 transition-all focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400`}>
              <div 
                onClick={() => setIsLocationModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 w-full text-surface-600 hover:text-indigo-600 cursor-pointer transition-colors ${user?.role === 'USER' ? 'border-r border-surface-300 min-w-[140px]' : 'rounded-full'}`}
              >
                <MapPin size={18} className="text-secondary-500 shrink-0" />
                <span className="text-sm font-bold truncate">{locationName}</span>
              </div>
              {user?.role === 'USER' && (
                <div className="flex flex-1 items-center px-4 py-2">
                  <Search size={18} className="text-surface-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search for a service..." 
                    className="w-full bg-transparent border-none outline-none px-3 text-sm font-medium text-surface-900 placeholder-surface-500 h-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-2 mx-auto">
            {links.map(({ to, label, icon: Icon }) => (
              to.includes('#') ? (
                <a
                  key={to}
                  href={to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full text-surface-600 hover:text-primary-600 hover:bg-surface-100 transition-all duration-200 group"
                >
                  <Icon size={18} className="text-surface-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-sm font-semibold tracking-wide">{label}</span>
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full text-surface-600 hover:text-primary-600 hover:bg-surface-100 transition-all duration-200 group"
                >
                  <Icon size={18} className="text-surface-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-sm font-semibold tracking-wide">{label}</span>
                </Link>
              )
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4 ml-4 pl-4 border-l border-surface-200">
            {isAuthenticated ? (
              <>
                {user?.role === 'USER' && (
                   <button className="text-surface-500 hover:text-primary-600 transition-colors relative">
                     <ShoppingCart size={22} />
                     <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                   </button>
                )}
                
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }}
                  className="p-2 rounded-full text-surface-500 hover:text-red-600 hover:bg-red-50 transition-all ml-2 relative z-50 pointer-events-auto cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-surface-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-surface-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  Try for Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-surface-600 hover:text-primary-600 hover:bg-surface-100 transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl animate-slide-up border-t border-surface-200 shadow-xl absolute w-full left-0">
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated && (
              <button onClick={() => { setIsLocationModalOpen(true); setMobileOpen(false); }} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all font-semibold w-full mb-2">
                <MapPin size={18} />
                <span>Update Location</span>
              </button>
            )}
            {links.map(({ to, label, icon: Icon }) => (
              to.includes('#') ? (
                <a
                  key={to}
                  href={to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-surface-700 hover:text-primary-600 hover:bg-primary-50 transition-all font-semibold"
                >
                  <Icon size={18} className="text-surface-400" />
                  <span>{label}</span>
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-surface-700 hover:text-primary-600 hover:bg-primary-50 transition-all font-semibold"
                >
                  <Icon size={18} className="text-surface-400" />
                  <span>{label}</span>
                </Link>
              )
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 w-full font-semibold transition-all mt-4 border border-red-100"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            )}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-surface-200">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-center text-sm py-2">Sign In</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="bg-surface-900 text-white rounded-xl text-center text-sm py-2 font-bold">Try for Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;
