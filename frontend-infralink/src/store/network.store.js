import { create } from 'zustand';
import { networkService } from '../features/network/api/network.service.js';

const useNetworkStore = create((set, get) => ({
  isLoading: false,
  error: null,
  
  // Follow action wrappers to keep UI clean
  followUser: async (targetId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await networkService.followUser(targetId);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to follow user', isLoading: false });
      throw error;
    }
  },

  unfollowUser: async (targetId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await networkService.unfollowUser(targetId);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to unfollow', isLoading: false });
      throw error;
    }
  },

  blockUser: async (targetId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await networkService.blockUser(targetId);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to block', isLoading: false });
      throw error;
    }
  },

  unblockUser: async (targetId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await networkService.unblockUser(targetId);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to unblock', isLoading: false });
      throw error;
    }
  },

  fetchStatus: async (targetId) => {
    try {
      const data = await networkService.fetchStatus(targetId);
      return data.data; // { status, is_following_back, is_allowed, restriction_reason }
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}));

export default useNetworkStore;
