import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request Interceptor: Add Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch custom event if needed, or safely trigger redirect
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Response helper to match Zustand store expectations
// The backend returns: { success: true, data: { ... } }
// Stores expect: const res = await apiCall(); const { items } = res.data;
const wrapResponse = async (promise) => {
  try {
    const response = await promise;
    // We return { data: response.data.data } so that res.data in store yields the inner object
    return { data: response.data.data || response.data };
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'API Error');
    }
    throw error;
  }
};

// ─── Auth APIs ──────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => wrapResponse(api.post('/auth/signup', data)),
  login: (data) => wrapResponse(api.post('/auth/login', data)),
  getProfile: () => wrapResponse(api.get('/auth/profile')),
  updateLocation: (coordinates) => wrapResponse(api.put('/auth/location', { coordinates })),
};

// ─── Service APIs ───────────────────────────────────────────────
export const serviceAPI = {
  getAll: (params = {}) => wrapResponse(api.get('/services', { params })),
  getById: (id) => wrapResponse(api.get(`/services/${id}`)),
  create: (data) => wrapResponse(api.post('/services', data)),
  update: (id, data) => wrapResponse(api.put(`/services/${id}`, data)),
  delete: (id) => wrapResponse(api.delete(`/services/${id}`)),
  toggleAvailability: (id) => wrapResponse(api.patch(`/services/${id}/availability`)),
  getMyServices: () => wrapResponse(api.get('/services/provider/me')),
};

// ─── Request APIs ───────────────────────────────────────────────
export const requestAPI = {
  create: (data) => wrapResponse(api.post('/requests', data)),
  getAll: () => wrapResponse(api.get('/requests')),
  getById: (id) => wrapResponse(api.get(`/requests/${id}`)),
  accept: (id) => wrapResponse(api.put(`/requests/${id}/accept`)),
  updateStatus: (id, status, note) => wrapResponse(api.put(`/requests/${id}/status`, { status, resolutionNote: note })),
  getBroadcasted: () => wrapResponse(api.get('/requests/broadcasted')),
};

// ─── Chat APIs ──────────────────────────────────────────────────
export const chatAPI = {
  getConversations: () => wrapResponse(api.get('/chat/conversations')),
  getConversation: (requestId) => wrapResponse(api.get(`/chat/request/${requestId}`)),
  getMessages: (conversationId) => wrapResponse(api.get(`/chat/${conversationId}/messages`)),
  sendMessage: (data) => wrapResponse(api.post('/chat/messages', data)),
  markAsSeen: (conversationId) => wrapResponse(api.put(`/chat/${conversationId}/seen`)),
};

// ─── Admin APIs ─────────────────────────────────────────────────
export const adminAPI = {
  getUsers: () => wrapResponse(api.get('/admin/users')),
  toggleBlock: (id) => wrapResponse(api.put(`/admin/users/${id}/block`)),
  getStats: () => wrapResponse(api.get('/admin/stats')),
};

export default api;
