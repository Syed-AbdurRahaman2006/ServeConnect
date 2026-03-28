import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useServiceStore from '../store/serviceStore';
import useAuthStore from '../store/authStore';
import useRequestStore from '../store/requestStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MapPin, DollarSign, Star, Clock, User,
  Send, CheckCircle
} from 'lucide-react';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentService, loading, fetchServiceById } = useServiceStore();
  const { createRequest } = useRequestStore();
  const { user, isAuthenticated } = useAuthStore();
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    fetchServiceById(id);
  }, [id]);

  const handleCreateRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to create a request');
      return navigate('/login');
    }
    if (user?.role !== 'USER') {
      return toast.error('Only users can create service requests');
    }
    try {
      setSubmitting(true);
      const res = await createRequest({ serviceId: id, description });
      toast.success(`Request created! Broadcast to ${res.data.broadcastCount} providers.`);
      setRequestSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !currentService) return <LoadingSpinner text="Loading service details..." />;

  const service = currentService;

  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-surface-600 hover:text-surface-900 transition-colors mb-6 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="badge-primary">{service.category}</span>
              <span className={`badge ${service.availability ? 'badge-accent' : 'badge-danger'}`}>
                {service.availability ? '✓ Available' : '✗ Unavailable'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-4">{service.title}</h1>
            <p className="text-surface-600 leading-relaxed">{service.description}</p>

            <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-surface-200">
              <div className="flex items-center space-x-2">
                <DollarSign size={18} className="text-accent-400" />
                <span className="text-xl font-bold text-accent-300">₹{service.price}</span>
                <span className="text-surface-500">
                  /{service.priceUnit === 'per_hour' ? 'hour' : service.priceUnit === 'per_session' ? 'session' : 'fixed'}
                </span>
              </div>
              {service.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-surface-800 font-medium">{service.rating}</span>
                  <span className="text-surface-500">({service.totalReviews})</span>
                </div>
              )}
            </div>

            {service.tags && service.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {service.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-surface-100 rounded-lg text-xs text-surface-600 border border-surface-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Provider Info */}
          {service.provider && (
            <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-4">Service Provider</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-surface-900 font-semibold">{service.provider.name}</h4>
                  <p className="text-surface-500 text-sm">{service.provider.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Create Request */}
        <div className="space-y-6">
          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              {requestSent ? 'Request Sent!' : 'Request this Service'}
            </h3>

            {requestSent ? (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <p className="text-surface-600 mb-4">
                  Your request has been broadcast to nearby providers. You'll be notified when a provider accepts.
                </p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <textarea
                  className="input-field mb-4 resize-none"
                  rows={4}
                  placeholder="Describe what you need..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  onClick={handleCreateRequest}
                  disabled={submitting || !service.availability}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Send size={18} />
                  <span>{submitting ? 'Sending...' : 'Send Request'}</span>
                </button>
                {!service.availability && (
                  <p className="text-surface-500 text-sm text-center mt-3">
                    This service is currently unavailable
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ServiceDetailsPage;
