import { create } from 'zustand';
import api from '../lib/axios.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const useDirectoryStore = create((set, get) => ({
  professionals: [],
  pagination: null,
  filteredProfessionals: [],
  selectedProfessional: null,
  categoryStats: {}, // mapping of role -> count
  isLoading: false,
  error: null,

  fetchDirectoryStats: async () => {
    try {
      const { data } = await api.get('/directory/stats');
      set({ categoryStats: data.data });
    } catch (e) {
      console.error('Failed to fetch directory stats', e);
    }
  },


  fetchProfessionals: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/directory/professionals', { params });
      set({ 
        professionals: data.data, 
        pagination: data.pagination,
        isLoading: false 
      });
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  getProfessionalById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/directory/professionals/${id}`);
      set({ selectedProfessional: data.data, isLoading: false });
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  clearSelectedProfessional: () => set({ selectedProfessional: null }),
  clearError: () => set({ error: null }),
}));

export default useDirectoryStore;
