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

  followBuilder: async (builderProfileId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/builders/${builderProfileId}/follow`);
      set((state) => {
        if (state.selectedProfessional && state.selectedProfessional.builderProfile?._id === builderProfileId) {
          return {
            selectedProfessional: {
              ...state.selectedProfessional,
              followersCount: data.data.followersCount,
              isFollowing: data.data.isFollowing
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      return data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  unfollowBuilder: async (builderProfileId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/builders/${builderProfileId}/unfollow`);
      set((state) => {
        if (state.selectedProfessional && state.selectedProfessional.builderProfile?._id === builderProfileId) {
          return {
            selectedProfessional: {
              ...state.selectedProfessional,
              followersCount: data.data.followersCount,
              isFollowing: data.data.isFollowing
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      return data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  rateBuilder: async (builderProfileId, value, review) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/builders/${builderProfileId}/rate`, { value, review });
      set((state) => {
        if (state.selectedProfessional && state.selectedProfessional.builderProfile?._id === builderProfileId) {
          return {
            selectedProfessional: {
              ...state.selectedProfessional,
              averageRating: data.data.averageRating,
              totalReviews: data.data.totalReviews
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      return data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  followContractor: async (contractorProfileId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contractors/${contractorProfileId}/follow`);
      set((state) => {
        if (state.selectedProfessional && (state.selectedProfessional.contractorProfile?._id === contractorProfileId || state.selectedProfessional._id === contractorProfileId)) {
          return {
            selectedProfessional: {
              ...state.selectedProfessional,
              followersCount: data.data.followersCount,
              isFollowing: data.data.isFollowing
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      return data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  unfollowContractor: async (contractorProfileId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contractors/${contractorProfileId}/unfollow`);
      set((state) => {
        if (state.selectedProfessional && (state.selectedProfessional.contractorProfile?._id === contractorProfileId || state.selectedProfessional._id === contractorProfileId)) {
          return {
            selectedProfessional: {
              ...state.selectedProfessional,
              followersCount: data.data.followersCount,
              isFollowing: data.data.isFollowing
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      return data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  rateContractor: async (contractorProfileId, value, review) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post(`/contractors/${contractorProfileId}/rate`, { value, review });
      set((state) => {
        if (state.selectedProfessional && (state.selectedProfessional.contractorProfile?._id === contractorProfileId || state.selectedProfessional._id === contractorProfileId)) {
          return {
            selectedProfessional: {
              ...state.selectedProfessional,
              averageRating: data.data.averageRating,
              totalReviews: data.data.totalReviews
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
      return data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  clearSelectedProfessional: () => set({ selectedProfessional: null }),
  clearError: () => set({ error: null }),
}));

export default useDirectoryStore;
