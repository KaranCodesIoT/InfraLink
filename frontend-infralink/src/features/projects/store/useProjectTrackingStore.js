import { create } from 'zustand';
import * as api from '../services/projectTracking.api.js';

export const useProjectTrackingStore = create((set, get) => ({
    // State
    projects: [],
    currentProject: null,
    projectUpdates: [],
    missingUpdates: null,
    myInvites: [],
    myScoreCard: null,
    leaderboard: [],
    
    pagination: null,
    updatesPagination: null,
    
    isLoading: false,
    isUpdatesLoading: false,
    isScoreLoading: false,
    error: null,

    // Actions
    
    fetchMyProjects: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.listMyProjects(params);
            set({ projects: res.data, pagination: res.pagination, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isLoading: false });
        }
    },

    fetchProjectDetail: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.getProjectDetail(id);
            set({ currentProject: res.data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isLoading: false });
        }
    },

    createProject: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.createProject(data);
            set(state => ({ 
                projects: [res.data, ...state.projects],
                isLoading: false 
            }));
            return res.data;
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isLoading: false });
            throw error;
        }
    },

    updateStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.updateProjectStatus(id, status);
            set(state => ({
                currentProject: state.currentProject?._id === id ? { ...state.currentProject, status: res.data.status } : state.currentProject,
                projects: state.projects.map(p => p._id === id ? { ...p, status: res.data.status } : p),
                isLoading: false
            }));
            return res.data;
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isLoading: false });
            throw error;
        }
    },

    fetchMyInvites: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.getMyInvites();
            set({ myInvites: res.data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isLoading: false });
        }
    },

    respondToInvite: async (projectId, accept) => {
        set({ isLoading: true, error: null });
        try {
            await api.respondToAssignment(projectId, accept);
            set(state => ({
                myInvites: state.myInvites.filter(p => p._id !== projectId),
                isLoading: false
            }));
            // Refresh projects if accepted
            if (accept) {
                await get().fetchMyProjects();
            }
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isLoading: false });
            throw error;
        }
    },

    getMissingUpdates: async (projectId, date) => {
        try {
            const res = await api.getMissingUpdates(projectId, date);
            return res;
        } catch (error) {
            console.error(error);
            return { data: { missing: [] } };
        }
    },

    checkTodayStatus: async (projectId) => {
        try {
            const res = await api.checkTodayStatus(projectId);
            return res;
        } catch (error) {
            console.error(error);
            return { data: { submitted: false } };
        }
    },

    removeWorker: async (projectId, workerId) => {
        try {
            await api.removeWorker(projectId, workerId);
            set(state => ({
                currentProject: state.currentProject ? {
                    ...state.currentProject,
                    assignedWorkers: state.currentProject.assignedWorkers.filter(w => w.user?._id !== workerId)
                } : null
            }));
        } catch (error) {
            console.error(error);
        }
    },

    toggleMilestone: async (projectId, milestoneId) => {
        try {
            const res = await api.toggleMilestone(projectId, milestoneId);
            set(state => ({
                currentProject: state.currentProject ? {
                    ...state.currentProject,
                    milestones: res.data.milestones,
                    progress: res.data.progress,
                    status: res.data.status
                } : null
            }));
        } catch (error) {
            console.error(error);
        }
    },

    fetchProjectUpdates: async (projectId, params = {}) => {
        set({ isUpdatesLoading: true, error: null });
        try {
            const res = await api.getProjectUpdates(projectId, params);
            set({ projectUpdates: res.data, updatesPagination: res.pagination, isUpdatesLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isUpdatesLoading: false });
        }
    },

    submitUpdate: async (projectId, formData) => {
        set({ isUpdatesLoading: true, error: null });
        try {
            const res = await api.submitDailyUpdate(projectId, formData);
            set(state => ({
                projectUpdates: [res.data, ...state.projectUpdates],
                isUpdatesLoading: false
            }));
            return res.data;
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isUpdatesLoading: false });
            throw error;
        }
    },

    fetchScoreCard: async () => {
        set({ isScoreLoading: true, error: null });
        try {
            const res = await api.getMyScoreCard();
            set({ myScoreCard: res.data, isScoreLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.error?.message || error.message, isScoreLoading: false });
        }
    },

    clearError: () => set({ error: null })
}));
