import { create } from 'zustand';
import api from '../lib/axios.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const useJobStore = create((set) => ({
  jobs: [],
  currentJob: null,
  pagination: null,
  isLoading: false,
  error: null,

  fetchJobs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/jobs', { params });
      set({ jobs: data.data, pagination: data.pagination, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  fetchJobById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/jobs/${id}`);
      set({ currentJob: data.data, isLoading: false });
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  createJob: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/jobs', payload);
      set((s) => ({ jobs: [data.data, ...s.jobs], isLoading: false }));
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useJobStore;
