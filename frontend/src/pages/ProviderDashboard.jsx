import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRequestStore from '../store/requestStore';
import useServiceStore from '../store/serviceStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import LocationModal from '../components/LocationModal';
import { socketService } from '../services/socket';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Briefcase, Plus, MessageSquare, Check, X,
  BarChart3, Wrench, ArrowRight, Eye, EyeOff, Trash2, 
  Menu, LogOut, Bell, Search, MapPin, LayoutDashboard, ClipboardList, User,
  TrendingUp, DollarSign, Clock, CheckCircle2, Zap, Star, ChevronRight,
  Activity, Shield, Sparkles, ArrowUpRight, Package
} from 'lucide-react';

const CATEGORIES = [
  'Cleaning','Repair','Electrician','Beauty','Painting','Plumbing','Other',
];

const ProviderDashboard = () => {
  const { requests, broadcastedRequests, loading, fetchRequests, fetchBroadcasted, acceptRequest, updateStatus } = useRequestStore();
  const { myServices, fetchMyServices, createService, deleteService, toggleAvailability } = useServiceStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', category: 'Cleaning', price: '', priceUnit: 'fixed',
  });

  useEffect(() => {
    fetchRequests();
    fetchBroadcasted();
    fetchMyServices();
    socketService.joinBroadcast();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const savedLoc = localStorage.getItem('userLocation');
    if (!savedLoc) {
      setTimeout(() => setLocationModalOpen(true), 1000);
    }

    socketService.on('request:created', ({ request }) => {
      toast('📡 New service request nearby!', { icon: '🔔' });
      fetchBroadcasted();
    });
    socketService.on('request:cancelled', ({ requestId }) => {
      fetchBroadcasted();
    });

    return () => {
      socketService.off('request:created');
      socketService.off('request:cancelled');
    };
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await acceptRequest(requestId);
      toast.success('Request accepted!');
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to accept');
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await updateStatus(requestId, 'COMPLETED');
      toast.success('Job completed!');
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await createService({ ...serviceForm, price: Number(serviceForm.price) });
      toast.success('Service created!');
      setShowServiceForm(false);
      setServiceForm({ title: '', description: '', category: 'Cleaning', price: '', priceUnit: 'fixed' });
    } catch (err) {
      toast.error(err.message || 'Failed to create service');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED');
  const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.serviceId?.price || 0), 0);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'requests', label: 'Requests', icon: Radio, count: broadcastedRequests.length },
    { id: 'services', label: 'My Services', icon: Package, count: myServices.length },
  ];

  // ─────────── ANALYTICS DASHBOARD TAB ───────────
  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👋</span>
            <span className="text-surface-500 font-semibold">{greeting},</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-surface-900 tracking-tight leading-tight">
            {user?.name || 'Provider'}
          </h1>
          <p className="text-surface-500 font-medium mt-1">Here's your business overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-2xl text-sm font-bold">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Live & Active
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: 'Total Earnings', 
            value: `₹${totalEarnings.toLocaleString()}`, 
            icon: DollarSign,
            gradient: 'from-emerald-500 to-teal-500',
            bgLight: 'bg-emerald-50',
            change: '+12%',
            changeColor: 'text-emerald-600'
          },
          { 
            label: 'Active Jobs', 
            value: acceptedRequests.length, 
            icon: Briefcase,
            gradient: 'from-blue-500 to-indigo-500',
            bgLight: 'bg-blue-50',
            change: acceptedRequests.length > 0 ? 'In Progress' : 'None',
            changeColor: 'text-blue-600'
          },
          { 
            label: 'Completed', 
            value: completedRequests.length, 
            icon: CheckCircle2,
            gradient: 'from-violet-500 to-purple-500',
            bgLight: 'bg-violet-50',
            change: '100% success',
            changeColor: 'text-violet-600'
          },
          { 
            label: 'Services Listed', 
            value: myServices.length, 
            icon: Package,
            gradient: 'from-amber-500 to-orange-500',
            bgLight: 'bg-amber-50',
            change: `${myServices.filter(s => s.availability).length} active`,
            changeColor: 'text-amber-600'
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-surface-200 rounded-2xl p-6 hover:shadow-lg hover:border-surface-300 hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
          >
            <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-500`}></div>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                <stat.icon size={22} className="text-white" />
              </div>
              <span className={`text-xs font-bold ${stat.changeColor} ${stat.bgLight} px-2.5 py-1 rounded-lg`}>
                {stat.change}
              </span>
            </div>
            <p className="text-surface-500 text-sm font-bold mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-surface-900 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Two Column: Incoming Requests + Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Requests Preview */}
        <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Radio size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-surface-900">Incoming Requests</h3>
                <p className="text-surface-500 text-xs font-medium">{broadcastedRequests.length} pending</p>
              </div>
            </div>
            {broadcastedRequests.length > 0 && (
              <button onClick={() => setActiveTab('requests')} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:text-indigo-700">
                View All <ChevronRight size={16} />
              </button>
            )}
          </div>
          <div className="divide-y divide-surface-100">
            {broadcastedRequests.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Radio size={24} className="text-surface-400 animate-pulse" />
                </div>
                <p className="text-surface-500 font-semibold">Listening for requests...</p>
                <p className="text-surface-400 text-sm mt-1">New jobs will appear here</p>
              </div>
            ) : (
              broadcastedRequests.slice(0, 3).map((req) => (
                <div key={req._id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <Bell size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-surface-900 text-sm truncate">{req.serviceId?.title}</h4>
                      <p className="text-surface-500 text-xs font-medium truncate">{req.requesterId?.name} · {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                    </div>
                  </div>
                  <button onClick={() => handleAccept(req._id)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shrink-0 flex items-center gap-1.5 shadow-sm">
                    <Check size={14} /> Accept
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Jobs Preview */}
        <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Briefcase size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-surface-900">Active Jobs</h3>
                <p className="text-surface-500 text-xs font-medium">{acceptedRequests.length} in progress</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-surface-100">
            {acceptedRequests.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={24} className="text-surface-400" />
                </div>
                <p className="text-surface-500 font-semibold">No active jobs</p>
                <p className="text-surface-400 text-sm mt-1">Accept requests to start working</p>
              </div>
            ) : (
              acceptedRequests.slice(0, 3).map((req) => (
                <div key={req._id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Activity size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-surface-900 text-sm truncate">{req.serviceId?.title}</h4>
                      <p className="text-surface-500 text-xs font-medium truncate">Client: {req.requesterId?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => navigate(`/chat?requestId=${req._id}`)} className="bg-surface-100 text-surface-700 p-2 rounded-xl hover:bg-surface-200 transition" title="Chat">
                      <MessageSquare size={16} />
                    </button>
                    <button onClick={() => handleComplete(req._id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5">
                      <Check size={14} /> Done
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completed Jobs Table */}
      <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-surface-900">Recent Completed</h3>
            <p className="text-surface-500 text-xs font-medium">Your latest finished jobs</p>
          </div>
        </div>
        {completedRequests.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-surface-500 font-semibold">No completed jobs yet</p>
            <p className="text-surface-400 text-sm mt-1">Completed jobs will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {completedRequests.slice(0, 5).map(req => (
                  <tr key={req._id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
                          <Wrench size={16} />
                        </div>
                        <span className="text-sm font-bold text-surface-900">{req.serviceId?.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-600">{req.requesterId?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">₹{req.serviceId?.price || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-500">{new Date(req.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-bold">✓ Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );

  // ─────────── REQUESTS TAB ───────────
  const renderRequests = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-black text-surface-900 mb-1">Service Requests</h2>
        <p className="text-surface-500 font-medium">Incoming requests from nearby customers</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : broadcastedRequests.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Radio size={36} className="animate-pulse" />
          </div>
          <h3 className="text-2xl font-black text-surface-900 mb-2">Listening for requests</h3>
          <p className="text-surface-500 font-medium max-w-md mx-auto">New service requests from nearby users will appear here in real-time. Make sure your location is updated.</p>
          <div className="flex items-center justify-center gap-2 mt-6 text-emerald-600 font-bold text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Live connection active
          </div>
        </div>
      ) : (
        <div className="grid gap-4 max-w-4xl">
          {broadcastedRequests.map((req, index) => (
            <motion.div 
              key={req._id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Bell size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <h3 className="text-lg font-bold text-surface-900">{req.serviceId?.title}</h3>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200">🔔 New</span>
                  </div>
                  <p className="text-surface-600 mb-3 text-sm max-w-lg leading-relaxed">{req.description || 'No additional details provided.'}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-surface-400">
                    <span className="flex items-center gap-1.5 bg-surface-100 px-2.5 py-1 rounded-lg">
                      <User size={12}/> {req.requesterId?.name}
                    </span>
                    <span className="flex items-center gap-1.5 bg-surface-100 px-2.5 py-1 rounded-lg">
                      <Clock size={12}/> {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                    </span>
                    {req.serviceId?.price && (
                      <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                        <DollarSign size={12}/> ₹{req.serviceId.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleAccept(req._id)} 
                className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-7 py-3.5 rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <Check size={18} /> Accept Job
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Active Jobs Section */}
      {acceptedRequests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-black text-surface-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" /> Active Jobs
          </h3>
          <div className="grid gap-4 max-w-4xl">
            {acceptedRequests.map((req) => (
              <div key={req._id} className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-surface-900">{req.serviceId?.title}</h3>
                    <p className="text-surface-500 font-medium text-sm">Client: {req.requesterId?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button onClick={() => navigate(`/chat?requestId=${req._id}`)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-surface-100 text-surface-700 px-5 py-2.5 rounded-xl font-bold hover:bg-surface-200 transition">
                    <MessageSquare size={18} /> Chat
                  </button>
                  <button onClick={() => handleComplete(req._id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm">
                    <CheckCircle2 size={18} /> Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  // ─────────── SERVICES TAB ───────────
  const renderServices = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-surface-900 mb-1">My Services</h2>
          <p className="text-surface-500 font-medium">Manage the services you offer</p>
        </div>
        <button
          onClick={() => setShowServiceForm(!showServiceForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
            showServiceForm 
              ? 'bg-surface-200 text-surface-700 hover:bg-surface-300' 
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-500/20'
          }`}
        >
          {showServiceForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Service</>}
        </button>
      </div>

      {/* Service Creation Form */}
      <AnimatePresence>
        {showServiceForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateService} 
            className="bg-white border-2 border-indigo-200 shadow-lg shadow-indigo-100/50 rounded-2xl p-7 overflow-hidden"
          >
            <h3 className="font-bold text-xl text-surface-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              Create New Service
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Service Title</label>
                <input className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" value={serviceForm.title} onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})} placeholder="e.g. Deep Home Cleaning" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Category</label>
                <select className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" value={serviceForm.category} onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Price (₹)</label>
                <input type="number" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} placeholder="299" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">Price Unit</label>
                <select className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" value={serviceForm.priceUnit} onChange={(e) => setServiceForm({...serviceForm, priceUnit: e.target.value})}>
                  <option value="fixed">Fixed Amount</option>
                  <option value="per_hour">Per Hour</option>
                  <option value="per_session">Per Session</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-surface-700 mb-2">Description</label>
              <textarea className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-surface-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none" rows={3} value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} placeholder="Describe what's included in this service..." required />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2">
                <Sparkles size={16} /> Publish Service
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Services Grid */}
      {myServices.length === 0 && !showServiceForm ? (
        <div className="bg-surface-50 border-2 border-dashed border-surface-300 rounded-3xl p-16 text-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-surface-400 shadow-sm border border-surface-200">
            <Package size={36} />
          </div>
          <h3 className="text-xl font-black text-surface-900 mb-2">No services listed yet</h3>
          <p className="text-surface-500 font-medium mb-6">Create your first service to start receiving bookings</p>
          <button onClick={() => setShowServiceForm(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm">
            <Plus size={18} className="inline mr-2" />Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {myServices.map((svc, index) => (
            <motion.div 
              key={svc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 group ${svc.availability ? 'border-surface-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5' : 'border-surface-200 opacity-60'}`}
            >
              {/* Color stripe */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${svc.availability ? 'from-indigo-500 to-purple-500' : 'from-surface-300 to-surface-400'}`}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="bg-surface-100 text-surface-600 text-xs font-bold px-2.5 py-1 rounded-lg mb-2 inline-block uppercase tracking-wider">{svc.category}</span>
                    <h3 className="font-bold text-lg text-surface-900 line-clamp-1">{svc.title}</h3>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${svc.availability ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-surface-100 text-surface-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${svc.availability ? 'bg-emerald-500' : 'bg-surface-400'}`}></div>
                    {svc.availability ? 'Active' : 'Offline'}
                  </span>
                </div>
                
                <p className="text-surface-500 text-sm mb-5 line-clamp-2 min-h-[40px] leading-relaxed">{svc.description}</p>
                
                <div className="flex items-center justify-between border-t border-surface-100 pt-4">
                  <div>
                    <span className="text-2xl font-black text-surface-900">₹{svc.price}</span>
                    <span className="text-sm font-bold text-surface-400 ml-1">/ {svc.priceUnit.replace('_', ' ')}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => toggleAvailability(svc._id)} 
                      className={`p-2.5 rounded-xl transition-colors ${svc.availability ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                      title={svc.availability ? "Take Offline" : "Make Active"}
                    >
                      {svc.availability ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      onClick={() => deleteService(svc._id)} 
                      className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex overflow-hidden">
      <LocationModal 
        isOpen={locationModalOpen} 
        onClose={() => setLocationModalOpen(false)} 
        onSave={() => fetchBroadcasted()}
      />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─────────── SIDEBAR ─────────── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-surface-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-surface-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <div>
                <h2 className="text-lg font-black text-surface-900 leading-tight tracking-tight">ServeConnect</h2>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Provider</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-surface-400 hover:text-surface-700 p-1.5 rounded-lg hover:bg-surface-100">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Provider Profile Mini Card */}
        <div className="px-4 pt-6 pb-2">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-surface-900 truncate text-sm">{user?.name}</p>
                <p className="text-indigo-600 text-xs font-bold">Pro Provider</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              Online & Accepting Jobs
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20' 
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={activeTab === item.id ? 'text-indigo-200' : 'text-surface-400'} />
                <span>{item.label}</span>
              </div>
              {item.count !== null && item.count > 0 && (
                <span className={`min-w-[24px] text-center px-2 py-0.5 rounded-lg text-xs font-black ${
                  activeTab === item.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-surface-100 space-y-2">
          <button 
            onClick={() => setLocationModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <MapPin size={18} className="text-indigo-500" />
            <span>Update Location</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} className="text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─────────── MAIN CONTENT ─────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-surface-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-surface-600 hover:text-surface-900 bg-surface-100 p-2 rounded-xl hover:bg-surface-200 transition">
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-surface-900">{navItems.find(i => i.id === activeTab)?.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {broadcastedRequests.length > 0 && (
              <button 
                onClick={() => setActiveTab('requests')}
                className="relative bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-100 transition flex items-center gap-2"
              >
                <Bell size={16} />
                <span className="hidden sm:inline">{broadcastedRequests.length} New Request{broadcastedRequests.length > 1 ? 's' : ''}</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{broadcastedRequests.length}</span>
              </button>
            )}
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-emerald-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="hidden sm:inline">Live</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'requests' && renderRequests()}
            {activeTab === 'services' && renderServices()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
