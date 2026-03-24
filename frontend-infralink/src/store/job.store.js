import { create } from 'zustand';
import api from '../lib/axios.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const useJobStore = create((set, get) => ({
  jobs: [],
  myJobs: [],
  myApplications: [],
  currentJob: null,
  pagination: null,
  myJobsPagination: null,
  myApplicationsPagination: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  // ── Fetch all jobs (public board) ──────────────────────────────────────────
  fetchJobs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/jobs', { params });
      set({ jobs: data.data, pagination: data.pagination, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  // ── Fetch single job ───────────────────────────────────────────────────────
  fetchJobById: async (id) => {
    set({ isLoading: true, error: null, currentJob: null });
    try {
      const { data } = await api.get(`/jobs/${id}`);
      set({ currentJob: data.data, isLoading: false });
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
      throw e;
    }
  },

  // ── Create a job ───────────────────────────────────────────────────────────
  createJob: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await api.post('/jobs', payload);
      set((s) => ({ myJobs: [data.data, ...s.myJobs], isSubmitting: false }));
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isSubmitting: false });
      throw e;
    }
  },

  // ── Update a job ───────────────────────────────────────────────────────────
  updateJob: async (id, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await api.patch(`/jobs/${id}`, payload);
      set((s) => ({
        myJobs: s.myJobs.map((j) => (j._id === id ? data.data : j)),
        isSubmitting: false,
      }));
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isSubmitting: false });
      throw e;
    }
  },

  // ── Delete a job ───────────────────────────────────────────────────────────
  deleteJob: async (id) => {
    set({ isSubmitting: true });
    try {
      await api.delete(`/jobs/${id}`);
      set((s) => ({
        myJobs: s.myJobs.filter((j) => j._id !== id),
        jobs: s.jobs.filter((j) => j._id !== id),
        isSubmitting: false,
      }));
    } catch (e) {
      set({ error: getErrorMessage(e), isSubmitting: false });
      throw e;
    }
  },

  // ── My Posted Jobs ─────────────────────────────────────────────────────────
  fetchMyJobs: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/jobs/my', { params });
      set({ myJobs: data.data, myJobsPagination: data.pagination, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  // ── My Applications ────────────────────────────────────────────────────────
  fetchMyApplications: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/applications/my', { params });
      set({ myApplications: data.data, myApplicationsPagination: data.pagination, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  // ── Apply to a job ─────────────────────────────────────────────────────────
  applyToJob: async (jobId, payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await api.post('/applications', { job: jobId, ...payload });
      set({ isSubmitting: false });
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e), isSubmitting: false });
      throw e;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useJobStore;
