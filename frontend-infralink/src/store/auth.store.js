import { create } from 'zustand';
import api from '../lib/axios.js';
import { getAccessToken, setTokens, clearTokens } from '../utils/tokenStorage.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,

  // Restore auth state from stored token on app load
  initAuth: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isInitializing: false });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, isInitializing: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },

  devOtp: null,

  sendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      set({ isLoading: false, devOtp: data.data?.otp || null });
      return data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  checkOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/check-otp', { email, otp });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Invalid or expired OTP',
        isLoading: false,
      });
      throw error;
    }
  },

  verifyOtp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/verify-otp', { email, password });
      const { user, accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  googleLogin: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/google-auth', { token });
      const { user, accessToken, refreshToken } = data.data;
      setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  updateRole: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: response } = await api.post('/auth/update-role', data);
      const { user } = response.data;
      set({ user, isLoading: false });
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

  uploadResume: async (userId, file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('resume', file);

      await api.post(`/users/${userId}/resume`, formData, {
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
