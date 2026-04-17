import { create } from 'zustand';
import axiosInstance from '../lib/axios.js';
import {
  MOCK_PROJECT, MOCK_WORKFLOW, MOCK_TASKS, MOCK_WORKERS, MOCK_ATTENDANCE,
  MOCK_MATERIALS, MOCK_SUPPLY_ORDERS, MOCK_FINANCE, MOCK_PAYMENTS,
  MOCK_ISSUES, MOCK_DAILY_UPDATES, MOCK_DOCUMENTS, MOCK_ACTIVITY,
  WORKER_ROLES_DATA, MOCK_CONTRACTORS, MOCK_ARCHITECTS, MOCK_ENGINEERS, MOCK_LABOUR_REQUESTS
} from '../features/project/data/mockData.js';

const useProjectDashboardStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  project: null,
  workflow: null,
  tasks: [],
  workers: [],
  attendance: [],
  materials: [],
  supplyOrders: [],
  finance: null,
  payments: [],
  issues: [],
  dailyUpdates: [],
  documents: [],
  activity: [],
  workerRoles: [],
  contractors: [],
  architects: [],
  engineers: [],
  labourRequests: [],
  isLoading: false,
  activeTab: 'overview',
  simulatorRole: 'builder', // 'builder', 'contractor', 'architect'
  selectedContractorId: null,

  // ── Dashboard Navigation ──────────────────────────────────────────────
  setActiveTab: (tab) => set({ activeTab: tab, selectedContractorId: null }),
  setSimulatorRole: (role) => set({ simulatorRole: role }),
  setSelectedContractorId: (id) => set({ selectedContractorId: id }),
  clearSelectedContractorId: () => set({ selectedContractorId: null }),

  // ── Load Dashboard Data ──────────────────────────────────────────────
  loadDashboardData: async (projectId) => {
    set({ isLoading: true });
    
    try {
      // Parallel fetch for teams and the new aggregated dashboard data
      const [teamsRes, dashRes] = await Promise.all([
        axiosInstance.get(`/builder-projects/${projectId}/teams`),
        axiosInstance.get(`/builder-projects/${projectId}/dashboard`)
      ]);

      const teams = teamsRes.data.data;
      const dash = dashRes.data.data;

      set({
        project: { ...MOCK_PROJECT, _id: projectId }, // Real ID, rest from mock for now
        workflow: dash.workflow || MOCK_WORKFLOW,
        tasks: dash.tasks || MOCK_TASKS,
        workers: MOCK_WORKERS, // Labour still managed via teams for now
        attendance: MOCK_ATTENDANCE,
        materials: MOCK_MATERIALS,
        supplyOrders: MOCK_SUPPLY_ORDERS,
        finance: MOCK_FINANCE,
        payments: MOCK_PAYMENTS,
        issues: dash.issues || MOCK_ISSUES,
        dailyUpdates: dash.dailyUpdates || MOCK_DAILY_UPDATES,
        documents: MOCK_DOCUMENTS,
        activity: MOCK_ACTIVITY,
        workerRoles: WORKER_ROLES_DATA,
        contractors: teams.contractors || [],
        architects: teams.architects || [],
        engineers: teams.engineers || [],
        labourRequests: teams.labourRequests || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load project dashboard data', error);
      // Fallback logic kept for safety
      set({
        project: { ...MOCK_PROJECT, _id: projectId },
        workflow: MOCK_WORKFLOW,
        tasks: MOCK_TASKS,
        isLoading: false,
      });
    }
  },

  // ── Real-time Workflow Actions ──────────────────────────────────────────
  assignContractorToTask: async (phaseId, taskId, contractorId) => {
    const { project } = get();
    try {
      const res = await axiosInstance.patch(`/builder-projects/${project._id}/tasks/assign`, {
        phaseId, taskId, contractorId
      });
      set({ workflow: res.data.data });
      return res.data.data;
    } catch (err) {
      console.error('Task assignment failed', err);
      throw err;
    }
  },

  // ── Daily Update Actions (Site Logs) ────────────────────────────────────
  submitDailyLog: async (logData) => {
    const { project } = get();
    try {
      const res = await axiosInstance.post(`/builder-projects/${project._id}/daily-log`, logData);
      set((s) => ({ dailyUpdates: [res.data.data, ...s.dailyUpdates] }));
      return res.data.data;
    } catch (err) {
      console.error('Failed to submit log', err);
      throw err;
    }
  },

  verifyDailyLog: async (updateId) => {
    const { project } = get();
    try {
      const res = await axiosInstance.patch(`/builder-projects/${project._id}/daily-log/${updateId}/verify`);
      set((s) => ({
        dailyUpdates: s.dailyUpdates.map(upd => upd._id === updateId ? res.data.data : upd)
      }));
      return res.data.data;
    } catch (err) {
      console.error('Verification failed', err);
      throw err;
    }
  },

  // ── Workforce Actions ───────────────────────────────────────────────────
  postLabourReq: async (reqData) => {
    const { project } = get();
    try {
      const res = await axiosInstance.post(`/builder-projects/${project._id}/labour-req`, reqData);
      set((s) => ({ labourRequests: [res.data.data, ...s.labourRequests] }));
      return res.data.data;
    } catch (err) {
      console.error('Failed to post labour req', err);
      throw err;
    }
  },

  updateLabourApplicantStatus: async (requirementId, applicantUserId, status) => {
    const { project } = get();
    try {
      const res = await axiosInstance.patch(
        `/builder-projects/${project._id}/labour-req/${requirementId}/applicants/${applicantUserId}`,
        { status }
      );
      set((s) => ({
        labourRequests: s.labourRequests.map(r => r._id === requirementId ? res.data.data : r)
      }));
      return res.data.data;
    } catch (err) {
      console.error('Failed to update applicant status', err);
      throw err;
    }
  },



  // ── Task Actions ──────────────────────────────────────────────────────
  addTask: (task) => set((s) => ({
    tasks: [{ ...task, id: `t${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] }, ...s.tasks]
  })),

  updateTaskStatus: (taskId, status) => set((s) => ({
    tasks: s.tasks.map(t => t.id === taskId ? { ...t, status } : t)
  })),

  // ── Issue Actions ─────────────────────────────────────────────────────
  addIssue: (issue) => set((s) => ({
    issues: [{ ...issue, id: `i${Date.now()}`, reportedAt: new Date().toISOString().split('T')[0], status: 'open' }, ...s.issues]
  })),

  updateIssueStatus: (issueId, status, resolution = '') => set((s) => ({
    issues: s.issues.map(i => i.id === issueId ? { ...i, status, resolution } : i)
  })),

  // ── Daily Update Actions ──────────────────────────────────────────────
  addDailyUpdate: (update) => set((s) => ({
    dailyUpdates: [{ ...update, id: `du${Date.now()}`, date: new Date().toISOString().split('T')[0] }, ...s.dailyUpdates]
  })),

  // ── Material Actions ──────────────────────────────────────────────────
  addMaterial: (material) => set((s) => ({
    materials: [{ ...material, id: `m${Date.now()}` }, ...s.materials]
  })),

  // ── Payment Actions ───────────────────────────────────────────────────
  addPayment: (payment) => set((s) => ({
    payments: [{ ...payment, id: `p${Date.now()}` }, ...s.payments]
  })),

  // ── Document Actions ──────────────────────────────────────────────────
  addDocument: (doc) => set((s) => ({
    documents: [{ ...doc, id: `d${Date.now()}`, uploadedAt: new Date().toISOString().split('T')[0], status: 'review' }, ...s.documents]
  })),

  // ── Workflow Actions ──────────────────────────────────────────────────
  updatePhaseProgress: (phaseId, progress) => set((s) => ({
    workflow: {
      ...s.workflow,
      phases: s.workflow.phases.map(p =>
        p.id === phaseId ? { ...p, progress } : p
      )
    }
  })),

  // ── Stakeholder Interactions ────────────────────────────────────────────
  acceptContractor: async (contractorId) => {
    const s = get();
    const contractor = s.contractors.find(c => c.id === contractorId);
    
    // Safety check - if we have a real applicationId, hit the DB
    if (contractor?.applicationId && s.project?._id) {
      try {
        await axiosInstance.patch(`/builder-projects/${s.project._id}/apply/${contractor.applicationId}`, { status: 'accepted' });
        // After success, move to active group locally
        set({
          contractors: s.contractors.map(c => c.id === contractorId ? { ...c, status: 'accepted' } : c)
        });
      } catch (err) {
        console.error('Failed to accept contractor on backend', err);
        // Error handling here - maybe keep it pending and show a toast
        throw err;
      }
    } else {
      // If no application ID (mock data), just update locally
      set({
        contractors: s.contractors.map(c => c.id === contractorId ? { ...c, status: 'accepted' } : c)
      });
    }
  },
  
  rejectContractor: async (contractorId) => {
    const s = get();
    const contractor = s.contractors.find(c => c.id === contractorId);
    
    if (contractor?.applicationId && s.project?._id) {
      try {
        await axiosInstance.patch(`/builder-projects/${s.project._id}/apply/${contractor.applicationId}`, { status: 'rejected' });
        set({
          contractors: s.contractors.map(c => c.id === contractorId ? { ...c, status: 'rejected' } : c)
        });
      } catch (err) {
        console.error('Failed to reject contractor on backend', err);
        throw err;
      }
    } else {
      set({
        contractors: s.contractors.map(c => c.id === contractorId ? { ...c, status: 'rejected' } : c)
      });
    }
  },

  acceptLabourRequest: (requestId) => set((s) => {
    const request = s.labourRequests.find(r => r.id === requestId);
    if (!request) return s;
    
    // Add worker to workers list
    const newWorker = {
      id: `w${Date.now()}`,
      name: request.workerName,
      role: request.skill,
      phone: request.phone,
      status: 'active',
      attendance: 100,
      performance: 100,
      tasksCompleted: 0,
      hoursLogged: 0,
      dailyWage: request.expectedWage,
      contractorId: request.contractorId
    };

    return {
      labourRequests: s.labourRequests.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r),
      workers: [newWorker, ...s.workers],
      contractors: s.contractors.map(c => 
        c.id === request.contractorId ? { ...c, workersCount: c.workersCount + 1 } : c
      )
    };
  }),

  rejectLabourRequest: (requestId) => set((s) => ({
    labourRequests: s.labourRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r)
  })),

  // ── Reset ─────────────────────────────────────────────────────────────
  resetDashboard: () => set({
    project: null, workflow: null, tasks: [], workers: [], attendance: [],
    materials: [], supplyOrders: [], finance: null, payments: [], issues: [],
    dailyUpdates: [], documents: [], activity: [], workerRoles: [],
    contractors: [], architects: [], engineers: [], labourRequests: [],
    isLoading: false, activeTab: 'overview',
  }),
}));

export default useProjectDashboardStore;
