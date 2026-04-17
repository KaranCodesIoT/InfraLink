import React from 'react';
import { 
  ArrowLeft, Users, Briefcase, Activity, 
  CheckCircle2, Clock, AlertTriangle, IndianRupee,
  ChevronRight, Calendar, UserCheck, UserX,
  FileText, ShieldCheck, ShieldAlert
} from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';
import { Link } from 'react-router-dom';

export default function ContractorDetailView() {
  const { 
    selectedContractorId, 
    clearSelectedContractorId,
    contractors,
    tasks,
    workers,
    dailyUpdates,
    labourRequests,
    acceptLabourRequest,
    rejectLabourRequest,
    verifyDailyUpdate
  } = useProjectDashboardStore();

  const contractor = contractors.find(c => (c._id === selectedContractorId || c.id === selectedContractorId));
  
  if (!contractor) return null;

  const cId = contractor._id || contractor.id;

  // ── Data Filtering ───────────────────────────────────────────────────
  // Find tasks assigned to this contractor within the workflow phases
  const contractorTasks = [];
  useProjectDashboardStore.getState().workflow?.phases?.forEach(phase => {
    phase.tasks?.forEach(task => {
      if (task.assignedContractor === cId || task.assignedContractorId === cId) {
        contractorTasks.push({ ...task, phaseId: phase._id || phase.id });
      }
    });
  });

  const contractorWorkers = workers.filter(w => (w.contractorId === cId || w.contractor === cId));
  const contractorUpdates = dailyUpdates.filter(u => (u.contractorId === cId || u.contractor === cId));
  
  // Real labour applications from the new array-based schema
  const pendingLabour = [];
  labourRequests.forEach(req => {
    if (req.contractor === cId || req.contractorId === cId) {
      req.applicants?.forEach(app => {
        if (app.status === 'pending') {
          pendingLabour.push({ ...app, requirementId: req._id || req.id, workerName: app.user?.name || 'Worker' });
        }
      });
    }
  });

  const { verifyDailyLog, updateLabourApplicantStatus } = useProjectDashboardStore.getState();

  const handleVerify = async (logId) => {
    try {
      await verifyDailyLog(logId);
    } catch (err) {
      alert('Failed to verify log');
    }
  };

  const handleApplicantStatus = async (reqId, appUserId, status) => {
    try {
      await updateLabourApplicantStatus(reqId, appUserId, status);
    } catch (err) {
      alert('Status update failed');
    }
  };

  const stats = [
    { label: 'Workforce', value: contractorWorkers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Tasks', value: contractorTasks.filter(t => t.status !== 'done').length, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completion', value: `${contractor.progress || 0}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Payout', value: '₹4.2L', icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={clearSelectedContractorId}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>Teams</span>
              <ChevronRight size={14} />
              <span className="font-medium text-gray-900">Contractor Dashboard</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {contractor.name}
              <span className="dash-badge success text-xs">{contractor.type} Partner</span>
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="dash-btn-secondary text-sm">Download Report</button>
          <button className="dash-btn-primary text-sm bg-orange-600 hover:bg-orange-700">Release Payment</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="dash-card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tasks & Scope */}
        <div className="lg:col-span-2 space-y-6">
          <section className="dash-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase size={20} className="text-orange-500" />
                Assigned Work Scope
              </h3>
              <span className="text-xs text-gray-500 font-medium">{contractorTasks.length} Total Assignments</span>
            </div>
            
            <div className="space-y-3">
              {contractorTasks.map(task => (
                <div key={task._id || task.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-orange-200 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={12} /> Due: {task.dueDate || 'TBD'} 
                        • <span className="capitalize">{task.priority || 'Medium'} Priority</span>
                      </p>
                    </div>
                    <span className={`dash-badge ${
                      task.status === 'done' || task.status === 'completed' ? 'success' : 
                      task.status === 'in_progress' || task.status === 'active' ? 'warning' : 'neutral'
                    }`}>
                      {(task.status || 'todo').replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex -space-x-2">
                      {(task.assignedWorkers || task.assignedWorkerIds)?.slice(0, 3).map((wId, idx) => (
                        <div key={idx} className="w-7 h-7 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                          ?
                        </div>
                      ))}
                    </div>
                    <button className="text-xs font-semibold text-gray-500 hover:text-gray-900">Manage Workforce</button>
                  </div>
                </div>
              ))}
              {contractorTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500 italic">No tasks assigned to this contractor.</div>
              )}
            </div>
          </section>

          {/* Daily Logs & Verification */}
          <section className="dash-card">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Activity size={20} className="text-green-500" />
              Real-time Site Logs
            </h3>
            <div className="space-y-4">
              {contractorUpdates.map(log => (
                <div key={log._id || log.id} className="p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{(log.worker?.name || log.author)}</h4>
                        <p className="text-xs text-gray-500">{log.role || 'Worker'} • {new Date(log.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {log.status === 'pending_verification' ? (
                      <button 
                        onClick={() => handleVerify(log._id || log.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <ShieldAlert size={14} /> Verify Log
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                        <ShieldCheck size={14} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-200">
                    {log.summary}
                  </p>
                </div>
              ))}
              {contractorUpdates.length === 0 && (
                <p className="text-center py-6 text-sm text-gray-500 italic">No daily updates submitted yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Workforce & Attendance */}
        <div className="space-y-6">
          {/* Hire New Talent */}
          {pendingLabour.length > 0 && (
            <section className="dash-card border-orange-200 bg-orange-50/20">
              <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-4">
                <Users size={16} /> Pending Workforce Apps
              </h3>
              <div className="space-y-3">
                {pendingLabour.map(app => (
                  <div key={app._id} className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-900">{app.workerName}</p>
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase">New Applicant</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApplicantStatus(app.requirementId, app.user?._id || app.user, 'accepted')}
                        className="flex-1 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-md hover:bg-gray-800"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleApplicantStatus(app.requirementId, app.user?._id || app.user, 'rejected')}
                        className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-md hover:bg-gray-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="dash-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Workforce</h3>
              <span className="dash-badge neutral text-[10px]">{contractorWorkers.length} Members</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {contractorWorkers.map(worker => (
                <div key={worker.id || worker._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold">
                        {worker.name?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{worker.name}</h4>
                        <p className="text-[10px] text-gray-500">{worker.role || 'Skilled Labour'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {contractorWorkers.length === 0 && (
                <p className="text-center py-4 text-xs text-gray-500">No active workforce members.</p>
              )}
            </div>
            <button className="w-full mt-6 py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-all">
              Invite More Workers
            </button>
          </section>

          {/* Issues Section */}
          <section className="dash-card bg-red-50/50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ShieldAlert size={20} className="text-red-500" />
              Project Issues
            </h3>
            <button className="w-full py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50">
              Report Site Issue
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

