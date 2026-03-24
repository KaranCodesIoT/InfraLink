import api from '../../../lib/axios.js';

export const applyToJob = (jobId, payload) =>
  api.post('/applications', { job: jobId, ...payload }).then((r) => r.data);

export const fetchMyApplications = (params) =>
  api.get('/applications/my', { params }).then((r) => r.data);

export const fetchApplicationsForJob = (jobId, params) =>
  api.get(`/applications/job/${jobId}`, { params }).then((r) => r.data);

export const updateApplicationStatus = (id, status) =>
  api.patch(`/applications/${id}`, { status }).then((r) => r.data);
