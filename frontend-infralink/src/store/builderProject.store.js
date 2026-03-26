import { create } from 'zustand';
import api from '../lib/axios.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const useBuilderProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  pagination: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  // ── Create a new builder project ──────────────────────────────────────────
  createProject: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await api.post('/builder-projects', payload);
      set((s) => ({ projects: [data.data, ...s.projects], isSubmitting: false }));
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isSubmitting: false });
      throw e;
    }
  },

  // ── Upload media files ────────────────────────────────────────────────────
  uploadMedia: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('media', file));
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.urls;
  },

  // ── Fetch all builder projects ────────────────────────────────────────────
  fetchProjects: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/builder-projects', { params });
      set({ projects: data.data, pagination: data.pagination, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  // ── Fetch my builder projects ─────────────────────────────────────────────
  fetchMyProjects: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/builder-projects/my', { params });
      set({ projects: data.data, pagination: data.pagination, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  // ── Fetch single project ─────────────────────────────────────────────────
  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null, currentProject: null });
    try {
      const { data } = await api.get(`/builder-projects/${id}`);
      set({ currentProject: data.data, isLoading: false });
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  addUpdate: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await api.post(`/builder-projects/${id}/updates`, payload);
      set({ currentProject: data.data, isSubmitting: false });
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isSubmitting: false });
      throw e;
    }
  },

  updateProject: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await api.patch(`/builder-projects/${id}`, payload);
      set((s) => ({ 
        currentProject: s.currentProject?._id === id ? { ...s.currentProject, ...data.data } : s.currentProject,
        isSubmitting: false 
      }));
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isSubmitting: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useBuilderProjectStore;
