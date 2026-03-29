import api from '../../../lib/axios.js';

/* ── Project CRUD ─────────────────────────────────────────────── */

export const createProject = async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
};

export const listMyProjects = async (params) => {
    const res = await api.get('/projects', { params });
    return res.data;
};

export const getProjectDetail = async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
};

export const updateProjectStatus = async (id, status) => {
    const res = await api.patch(`/projects/${id}/status`, { status });
    return res.data;
};

export const toggleMilestone = async (projectId, milestoneId) => {
    const res = await api.patch(`/projects/${projectId}/milestones/${milestoneId}/toggle`);
    return res.data;
};

/* ── Worker Assignment ────────────────────────────────────────── */

export const getMyInvites = async () => {
    const res = await api.get('/projects/invites');
    return res.data;
};

export const assignWorkers = async (id, workerIds) => {
    const res = await api.post(`/projects/${id}/assign`, { workerIds });
    return res.data;
};

export const respondToAssignment = async (id, accept) => {
    const res = await api.patch(`/projects/${id}/respond`, { accept });
    return res.data;
};

export const removeWorker = async (projectId, workerId) => {
    const res = await api.delete(`/projects/${projectId}/workers/${workerId}`);
    return res.data;
};

/* ── Daily Updates ─────────────────────────────────────────────── */

export const submitDailyUpdate = async (projectId, formData) => {
    // Note: formData contains both textNote/hoursWorked AND media files
    const res = await api.post(`/projects/${projectId}/updates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const checkTodayStatus = async (projectId) => {
    const res = await api.get(`/projects/${projectId}/updates/today`);
    return res.data;
};

export const getProjectUpdates = async (projectId, params) => {
    const res = await api.get(`/projects/${projectId}/updates`, { params });
    return res.data;
};

export const getMissingUpdates = async (projectId, date) => {
    const res = await api.get(`/projects/${projectId}/updates/missing`, { params: { date } });
    return res.data;
};

export const getWorkerUpdateHistory = async (projectId, workerId, params) => {
    const res = await api.get(`/projects/${projectId}/updates/worker/${workerId}`, { params });
    return res.data;
};

/* ── Worker Scores ─────────────────────────────────────────────── */

export const getMyScoreCard = async () => {
    const res = await api.get('/projects/scores/me');
    return res.data;
};

export const getScoreCard = async (userId) => {
    const res = await api.get(`/projects/scores/${userId}`);
    return res.data;
};

export const getLeaderboard = async (limit = 20) => {
    const res = await api.get('/projects/scores/leaderboard', { params: { limit } });
    return res.data;
};
