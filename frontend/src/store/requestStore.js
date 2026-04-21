import { create } from 'zustand';
import { requestAPI } from '../services/api';

/**
 * Request Store — Manages service request lifecycle state
 */
const useRequestStore = create((set) => ({
  requests: [],
  broadcastedRequests: [],
  currentRequest: null,
  loading: false,
  error: null,

  fetchRequests: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await requestAPI.getAll(params);
      set({ requests: res.data.requests || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchBroadcasted: async () => {
    set({ loading: true });
    try {
      const res = await requestAPI.getBroadcasted();
      set({ broadcastedRequests: res.data.requests || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createRequest: async (data) => {
    const res = await requestAPI.create(data);
    set((state) => ({
      requests: [res.data.request, ...state.requests],
    }));
    return res;
  },

  acceptRequest: async (id) => {
    const res = await requestAPI.accept(id);
    set((state) => ({
      broadcastedRequests: state.broadcastedRequests.filter((r) => r._id !== id),
      requests: [res.data.request, ...state.requests],
    }));
    return res;
  },

  updateStatus: async (id, status, note, metadata) => {
    const res = await requestAPI.updateStatus(id, status, note, metadata);
    set((state) => ({
      requests: state.requests.map((r) =>
        r._id === id ? res.data.request : r
      ),
    }));
    return res;
  },

  fetchRequestById: async (id) => {
    set({ loading: true });
    try {
      const res = await requestAPI.getById(id);
      set({ currentRequest: res.data.request, loading: false });
      return res.data.request;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Real-time update: add a new broadcasted request from socket
  addBroadcastedRequest: (request) => {
    set((state) => ({
      broadcastedRequests: [request, ...state.broadcastedRequests],
    }));
  },

  // Real-time update: remove a cancelled broadcast
  removeBroadcastedRequest: (requestId) => {
    set((state) => ({
      broadcastedRequests: state.broadcastedRequests.filter(
        (r) => r._id !== requestId
      ),
    }));
  },

  // Real-time update: update an existing user request automatically
  updateRequestInStore: (updatedRequest) => {
    set((state) => ({
      requests: state.requests.some(r => r._id === updatedRequest._id) 
        ? state.requests.map((r) => r._id === updatedRequest._id ? updatedRequest : r)
        : [updatedRequest, ...state.requests] // Insert if new
    }));
  },
}));

export default useRequestStore;
