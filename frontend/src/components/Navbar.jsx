import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  Menu, X, Home, Search, MessageSquare, LayoutDashboard,
  Shield, LogOut, User, Plus, Radio
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLinks = {
    USER: [
      { to: '/', label: 'Discover', icon: Search },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/chat', label: 'Messages', icon: MessageSquare },
    ],
    PROVIDER: [
      { to: '/', label: 'Home', icon: Home },
      { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/provider/requests', label: 'Requests', icon: Radio },
      { to: '/chat', label: 'Messages', icon: MessageSquare },
    ],
    ADMIN: [
      { to: '/', label: 'Home', icon: Home },
      { to: '/admin', label: 'Admin Panel', icon: Shield },
    ],
  };

  const links = isAuthenticated ? roleLinks[user?.role] || roleLinks.USER : [];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              ServeConnect
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800/60 transition-all duration-200"
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-dark-800/60">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-dark-200">{user?.name}</span>
                    <span className="text-dark-400 ml-1 text-xs">({user?.role})</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800/60 transition-all"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-light animate-slide-up border-t border-dark-700/50">
          <div className="px-4 py-3 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800/60 transition-all"
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-dark-800/60 w-full"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
