import { create } from 'zustand';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

/**
 * Auth Store — Manages authentication state with Zustand.
 * Persists user/token in localStorage.
 */
const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  signup: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.signup(data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      socketService.connect(token);
      set({ user, token, isAuthenticated: true, loading: false });
      return res;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.login(data);
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      socketService.connect(token);
      set({ user, token, isAuthenticated: true, loading: false });
      return res;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const user = { ...get().user, ...userData };
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  updateLocation: async (coordinates) => {
    try {
      const res = await authAPI.updateLocation(coordinates);
      if (res && res.data && res.data.user) {
        get().updateUser({ location: res.data.user.location });
      }
      return res;
    } catch (err) {
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  // Initialize socket connection on app load if token exists
  initSocket: () => {
    const token = get().token;
    if (token) {
      socketService.connect(token);
    }
  },
}));

export default useAuthStore;
