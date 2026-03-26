import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRequestStore from '../store/requestStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { socketService } from '../services/socket';
import {
  ClipboardList, Clock, CheckCircle, XCircle, MessageSquare,
  Plus, ArrowRight, Activity
} from 'lucide-react';

const UserDashboard = () => {
  const { requests, loading, fetchRequests } = useRequestStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
    // Listen for real-time request updates
    socketService.on('request:accepted', ({ request }) => {
      fetchRequests();
    });
    socketService.on('request:updated', () => fetchRequests());
    return () => {
      socketService.off('request:accepted');
      socketService.off('request:updated');
    };
  }, []);

  const activeRequests = requests.filter((r) => ['CREATED', 'ACCEPTED'].includes(r.status));
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED');
  const cancelledRequests = requests.filter((r) => ['CANCELLED', 'REJECTED'].includes(r.status));

  const stats = [
    { label: 'Active', value: activeRequests.length, icon: Activity, color: 'primary' },
    { label: 'Completed', value: completedRequests.length, icon: CheckCircle, color: 'accent' },
    { label: 'Cancelled', value: cancelledRequests.length, icon: XCircle, color: 'red' },
    { label: 'Total', value: requests.length, icon: ClipboardList, color: 'dark' },
  ];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400">Welcome back, {user?.name}</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary flex items-center space-x-2">
          <Plus size={18} />
          <span>Find Services</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center space-x-4">
            <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center`}>
              <stat.icon size={22} className={`text-${stat.color}-400`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-dark-400 text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Requests */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Clock size={18} className="text-primary-400" />
          <span>Active Requests</span>
        </h2>
        {loading ? (
          <LoadingSpinner />
        ) : activeRequests.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-dark-400">No active requests. Browse services to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRequests.map((req) => (
              <div key={req._id} className="card flex items-center justify-between hover:border-primary-500/30 transition-all">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-white">{req.serviceId?.title || 'Service'}</h3>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-dark-400 text-sm">
                    {req.providerId ? `Provider: ${req.providerId.name}` : 'Waiting for provider...'}
                  </p>
                  <p className="text-dark-500 text-xs mt-1">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {req.providerId && (
                    <button
                      onClick={() => navigate(`/chat?requestId=${req._id}`)}
                      className="btn-secondary px-3 py-2 text-sm"
                    >
                      <MessageSquare size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/requests/${req._id}`)}
                    className="p-2 text-dark-400 hover:text-primary-400"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request History */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <ClipboardList size={18} className="text-dark-400" />
          <span>History</span>
        </h2>
        {[...completedRequests, ...cancelledRequests].length === 0 ? (
          <p className="text-dark-500 text-sm">No past requests</p>
        ) : (
          <div className="space-y-3">
            {[...completedRequests, ...cancelledRequests].map((req) => (
              <div key={req._id} className="card flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-dark-200">{req.serviceId?.title || 'Service'}</h3>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-dark-500 text-xs mt-1">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
