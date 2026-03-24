import api from '../../../lib/axios.js';

export const fetchJobs = (params) => api.get('/jobs', { params }).then((r) => r.data);
export const fetchJobById = (id) => api.get(`/jobs/${id}`).then((r) => r.data);
export const createJob = (payload) => api.post('/jobs', payload).then((r) => r.data);
export const updateJob = (id, payload) => api.patch(`/jobs/${id}`, payload).then((r) => r.data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((r) => r.data);
export const fetchMyJobs = (params) => api.get('/jobs/my', { params }).then((r) => r.data);
