import { useState } from 'react';
import { Check, Clock, Lock, ChevronDown, ChevronUp, GitBranch, HardHat, Users } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

const PHASE_ICONS = { completed: Check, active: Clock, upcoming: Lock };

export default function WorkflowPage() {
  const { workflow, contractors } = useProjectDashboardStore();
  const [expandedPhase, setExpandedPhase] = useState(
    workflow?.phases?.find(p => p.status === 'active')?.id || null
  );

  if (!workflow) return null;

  const togglePhase = (id) => {
    setExpandedPhase(prev => prev === id ? null : id);
  };

  return (
    <div className="dash-animate-in">
      <div className="dash-section-title">
        <GitBranch className="dash-section-title-icon" />
        Project Workflow
      </div>

      {/* Phase Pipeline Stepper */}
      <div className="dash-pipeline">
        {workflow.phases?.map((phase, idx) => {
          const Icon = PHASE_ICONS[phase.status] || Lock;
          return (
            <div
              key={phase.id}
              className={`dash-pipeline-step ${phase.status}`}
              onClick={() => togglePhase(phase.id)}
              style={{ cursor: 'pointer' }}
            >
                <div className="dash-pipeline-step-number">
                {phase.status === 'completed' ? <Check style={{ width: 14, height: 14 }} /> : idx + 1}
              </div>
              <div className="dash-pipeline-step-label">{phase.label || phase.phaseName}</div>
              <div style={{ fontSize: 11, color: 'var(--dash-text-muted)', marginTop: 4 }}>
                {phase.progress}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {workflow.phases?.map((phase) => {
          const isExpanded = expandedPhase === phase.id || expandedPhase === phase._id;
          const Icon = PHASE_ICONS[phase.status];

          return (
            <div key={phase.id || phase._id} className="dash-card" style={{ overflow: 'hidden' }}>
              {/* Phase Header */}
              <div
                onClick={() => togglePhase(phase.id || phase._id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--dash-radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: phase.status === 'completed' ? 'var(--dash-success-subtle)' :
                      phase.status === 'active' ? 'var(--dash-accent-subtle)' : 'rgba(255,255,255,0.04)',
                    color: phase.status === 'completed' ? 'var(--dash-success)' :
                      phase.status === 'active' ? 'var(--dash-accent)' : 'var(--dash-text-muted)',
                  }}>
                    <Icon style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dash-text-primary)', marginBottom: 2 }}>
                      {phase.label || phase.phaseName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--dash-text-muted)' }}>
                      {phase.startDate || 'TBD'} — {phase.endDate || 'TBD'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`dash-badge ${phase.status === 'completed' ? 'success' : phase.status === 'active' ? 'accent' : 'neutral'}`}>
                      {phase.status === 'completed' ? 'Completed' : phase.status === 'active' ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>

                  <div style={{ minWidth: 120 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>Tasks</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dash-text-secondary)' }}>
                        {phase.completedTasks}/{phase.tasks}
                      </span>
                    </div>
                    <div className="dash-progress">
                      <div
                        className={`dash-progress-fill ${phase.status === 'completed' ? 'success' : ''}`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded ?
                    <ChevronUp style={{ width: 18, height: 18, color: 'var(--dash-text-muted)' }} /> :
                    <ChevronDown style={{ width: 18, height: 18, color: 'var(--dash-text-muted)' }} />
                  }
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{
                  marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--dash-border)',
                  animation: 'dash-fade-in 0.3s ease'
                }}>
                  {phase.notes && (
                    <div style={{
                      fontSize: 13, color: 'var(--dash-text-secondary)', lineHeight: 1.6,
                      padding: '12px 16px', background: 'var(--dash-bg-secondary)',
                      borderRadius: 'var(--dash-radius-sm)', marginBottom: 16,
                      borderLeft: `3px solid ${phase.status === 'completed' ? 'var(--dash-success)' : 'var(--dash-accent)'}`,
                    }}>
                      {phase.notes}
                    </div>
                  )}

                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sub-Tasks
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(phase.tasks || phase.subtasks)?.map((sub, idx) => {
                      // Support both real 'tasks' and mock 'subtasks' field
                      const taskId = sub._id || sub.id || idx;
                      const taskTitle = sub.title || sub.name;
                      const taskStatus = sub.status;
                      const assignedId = sub.assignedContractor || sub.assignedContractorId;
                      const contractor = contractors?.find(c => (c._id === assignedId || c.id === assignedId));
                      
                      return (
                        <div
                          key={taskId}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '12px 16px', borderRadius: 'var(--dash-radius-sm)',
                            background: 'var(--dash-bg-secondary)',
                            border: '1px solid var(--dash-border)',
                          }}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: taskStatus === 'completed' || taskStatus === 'done' ? 'var(--dash-success)' :
                              taskStatus === 'in_progress' || taskStatus === 'active' ? 'var(--dash-accent)' : 'rgba(255,255,255,0.06)',
                            color: taskStatus === 'upcoming' || taskStatus === 'todo' ? 'var(--dash-text-muted)' : 'white',
                            fontSize: 10, fontWeight: 700,
                          }}>
                            {taskStatus === 'completed' || taskStatus === 'done' ? <Check style={{ width: 12, height: 12 }} /> :
                              taskStatus === 'in_progress' || taskStatus === 'active' ? <Clock style={{ width: 12, height: 12 }} /> :
                                idx + 1}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 13, fontWeight: 500,
                              color: taskStatus === 'upcoming' || taskStatus === 'todo' ? 'var(--dash-text-muted)' : 'var(--dash-text-primary)',
                              textDecoration: taskStatus === 'completed' || taskStatus === 'done' ? 'line-through' : 'none',
                              opacity: taskStatus === 'upcoming' || taskStatus === 'todo' ? 0.6 : 1,
                              marginBottom: 4
                            }}>
                              {taskTitle}
                            </div>
                            
                            {(contractor || sub.workers > 0) && (
                              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--dash-text-muted)' }}>
                                {contractor && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <HardHat size={12} className="text-orange-500" />
                                    <span>{contractor.name}</span>
                                  </div>
                                )}
                                {sub.workers > 0 && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Users size={12} />
                                    <span>{sub.workers} Workers</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Builder Action: Assign Contractor */}
                            {useProjectDashboardStore.getState().simulatorRole === 'builder' && !contractor && (
                              <select 
                                className="text-xs bg-transparent border border-gray-700 rounded px-2 py-1 text-orange-500 font-medium"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    useProjectDashboardStore.getState().assignContractorToTask(phase._id || phase.id, taskId, e.target.value);
                                  }
                                }}
                              >
                                <option value="">Assign firm...</option>
                                {contractors?.filter(c => c.status === 'accepted').map(c => (
                                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                                ))}
                              </select>
                            )}

                            {taskStatus === 'in_progress' && (
                              <button className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded">
                                Add Update
                              </button>
                            )}
                            <span className={`dash-badge ${taskStatus === 'completed' || taskStatus === 'done' ? 'success' : taskStatus === 'in_progress' || taskStatus === 'active' ? 'info' : 'neutral'}`}>
                              {taskStatus === 'completed' || taskStatus === 'done' ? 'Done' : taskStatus === 'in_progress' || taskStatus === 'active' ? 'Active' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
