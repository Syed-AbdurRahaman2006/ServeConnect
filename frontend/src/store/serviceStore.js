import { create } from 'zustand';
import { serviceAPI } from '../services/api';

/**
 * Service Store — Manages service search/filter state
 */
const useServiceStore = create((set) => ({
  services: [],
  currentService: null,
  myServices: [],
  loading: false,
  error: null,
  pagination: { page: 1, pages: 1, total: 0 },
  filters: {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    maxDistance: '',
  },

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  fetchServices: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await serviceAPI.getAll(params);
      set({
        services: res.data.services,
        pagination: {
          page: res.data.page,
          pages: res.data.pages,
          total: res.data.total,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchServiceById: async (id) => {
    set({ loading: true });
    try {
      const res = await serviceAPI.getById(id);
      set({ currentService: res.data.service, loading: false });
      return res.data.service;
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyServices: async () => {
    set({ loading: true });
    try {
      const res = await serviceAPI.getMyServices();
      set({ myServices: res.data.services, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createService: async (data) => {
    const res = await serviceAPI.create(data);
    set((state) => ({
      myServices: [res.data.service, ...state.myServices],
    }));
    return res.data.service;
  },

  updateService: async (id, data) => {
    const res = await serviceAPI.update(id, data);
    set((state) => ({
      myServices: state.myServices.map((s) =>
        s._id === id ? res.data.service : s
      ),
    }));
    return res.data.service;
  },

  deleteService: async (id) => {
    await serviceAPI.delete(id);
    set((state) => ({
      myServices: state.myServices.filter((s) => s._id !== id),
    }));
  },

  toggleAvailability: async (id) => {
    const res = await serviceAPI.toggleAvailability(id);
    set((state) => ({
      myServices: state.myServices.map((s) =>
        s._id === id ? res.data.service : s
      ),
    }));
  },
}));

export default useServiceStore;
