import { create } from 'zustand';
import api from '../lib/axios.js';
import { getAccessToken, setTokens, clearTokens } from '../utils/tokenStorage.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Restore auth state from stored token on app load
  initAuth: async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      set({ isLoading: true });
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', payload);
      const { user, accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', payload);
      const { user, accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ } finally {
      clearTokens();
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  updateProfile: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/users/${userId}`, data);
      // Refresh user state from server
      const { data: me } = await api.get('/auth/me');
      set({ user: me.data, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  uploadAvatar: async (userId, file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      await api.post(`/users/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data: me } = await api.get('/auth/me');
      set({ user: me.data, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
