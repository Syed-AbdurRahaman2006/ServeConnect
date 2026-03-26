import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRequestStore from '../store/requestStore';
import useServiceStore from '../store/serviceStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { socketService } from '../services/socket';
import toast from 'react-hot-toast';
import {
  Radio, Briefcase, Plus, MessageSquare, Check, X,
  BarChart3, Wrench, ArrowRight, Eye, EyeOff, Trash2
} from 'lucide-react';

const CATEGORIES = [
  'Plumbing','Electrical','Cleaning','Painting','Carpentry',
  'Gardening','Tutoring','Fitness','Beauty','Cooking','Moving','Repair','Other',
];

const ProviderDashboard = () => {
  const { requests, broadcastedRequests, loading, fetchRequests, fetchBroadcasted, acceptRequest, updateStatus } = useRequestStore();
  const { myServices, fetchMyServices, createService, deleteService, toggleAvailability } = useServiceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('incoming');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', category: 'Plumbing', price: '', priceUnit: 'fixed',
  });

  useEffect(() => {
    fetchRequests();
    fetchBroadcasted();
    fetchMyServices();
    socketService.joinBroadcast();

    // Listen for broadcast events
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
      setServiceForm({ title: '', description: '', category: 'Plumbing', price: '', priceUnit: 'fixed' });
    } catch (err) {
      toast.error(err.message || 'Failed to create service');
    }
  };

  const acceptedRequests = requests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED');

  const tabs = [
    { id: 'incoming', label: 'Incoming', icon: Radio, count: broadcastedRequests.length },
    { id: 'active', label: 'Active Jobs', icon: Briefcase, count: acceptedRequests.length },
    { id: 'services', label: 'My Services', icon: Wrench, count: myServices.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Provider Dashboard</h1>
          <p className="text-dark-400">Manage your services and requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'bg-dark-800/60 text-dark-300 hover:bg-dark-700 border border-dark-700/50'
            }`}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
            {t.count !== null && t.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                tab === t.id ? 'bg-white/20' : 'bg-primary-500/20 text-primary-300'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Incoming Requests (Broadcast) */}
      {tab === 'incoming' && (
        <div>
          {loading ? <LoadingSpinner /> : broadcastedRequests.length === 0 ? (
            <div className="card text-center py-12">
              <Radio size={40} className="text-dark-500 mx-auto mb-4 animate-pulse-soft" />
              <h3 className="text-lg font-medium text-dark-300">Listening for requests...</h3>
              <p className="text-dark-500 text-sm">New requests from nearby users will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {broadcastedRequests.map((req) => (
                <div key={req._id} className="card hover:border-accent-500/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{req.serviceId?.title}</h3>
                      <p className="text-dark-400 text-sm">{req.description || 'No description provided'}</p>
                      <p className="text-dark-500 text-xs mt-2">From: {req.requesterId?.name} · {new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button onClick={() => handleAccept(req._id)} className="btn-accent px-4 py-2 text-sm flex items-center space-x-1">
                        <Check size={16} />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Jobs */}
      {tab === 'active' && (
        <div>
          {acceptedRequests.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-dark-400">No active jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedRequests.map((req) => (
                <div key={req._id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-white">{req.serviceId?.title}</h3>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-dark-400 text-sm">Client: {req.requesterId?.name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/chat?requestId=${req._id}`)}
                        className="btn-secondary px-3 py-2 text-sm"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={() => handleComplete(req._id)} className="btn-accent px-4 py-2 text-sm">
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Services */}
      {tab === 'services' && (
        <div>
          <button
            onClick={() => setShowServiceForm(!showServiceForm)}
            className="btn-primary mb-6 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>{showServiceForm ? 'Cancel' : 'Add Service'}</span>
          </button>
          {showServiceForm && (
            <form onSubmit={handleCreateService} className="card mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Title</label>
                  <input className="input-field" value={serviceForm.title} onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Category</label>
                  <select className="input-field" value={serviceForm.category} onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Price (₹)</label>
                  <input type="number" className="input-field" value={serviceForm.price} onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})} required />
                </div>
                <div>
                  <label className="text-sm text-dark-400 mb-1 block">Price Unit</label>
                  <select className="input-field" value={serviceForm.priceUnit} onChange={(e) => setServiceForm({...serviceForm, priceUnit: e.target.value})}>
                    <option value="fixed">Fixed</option>
                    <option value="per_hour">Per Hour</option>
                    <option value="per_session">Per Session</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400 mb-1 block">Description</label>
                <textarea className="input-field" rows={3} value={serviceForm.description} onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} required />
              </div>
              <button type="submit" className="btn-accent">Create Service</button>
            </form>
          )}
          <div className="space-y-3">
            {myServices.map((svc) => (
              <div key={svc._id} className="card flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-white">{svc.title}</h3>
                    <span className="badge-primary">{svc.category}</span>
                    <span className={svc.availability ? 'badge-accent' : 'badge-danger'}>
                      {svc.availability ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-dark-400 text-sm mt-1">₹{svc.price} / {svc.priceUnit}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => toggleAvailability(svc._id)} className="btn-secondary px-3 py-2 text-sm">
                    {svc.availability ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => deleteService(svc._id)} className="btn-danger px-3 py-2 text-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold gradient-text">{acceptedRequests.length}</p>
            <p className="text-dark-400 text-sm mt-1">Active Jobs</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-accent-400">{completedRequests.length}</p>
            <p className="text-dark-400 text-sm mt-1">Completed</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-white">{myServices.length}</p>
            <p className="text-dark-400 text-sm mt-1">Services Listed</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
