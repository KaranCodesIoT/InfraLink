import { useState } from 'react';
import { CheckSquare, Plus, Filter, AlertCircle, Clock, CheckCircle, Eye, X, Calendar, HardHat, Users } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'var(--dash-text-muted)' },
  { key: 'in_progress', label: 'In Progress', color: 'var(--dash-info)' },
  { key: 'review', label: 'Review', color: 'var(--dash-warning)' },
  { key: 'done', label: 'Done', color: 'var(--dash-success)' },
];

const PRIORITY_COLORS = {
  critical: { bg: 'var(--dash-danger-subtle)', color: 'var(--dash-danger)' },
  high: { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
  medium: { bg: 'var(--dash-warning-subtle)', color: 'var(--dash-warning)' },
  low: { bg: 'rgba(59,130,246,0.12)', color: 'var(--dash-info)' },
};

export default function TasksPage() {
  const { tasks, addTask, updateTaskStatus, contractors } = useProjectDashboardStore();
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', phase: 'structure', assignee: '' });

  const phases = ['all', 'planning', 'structure', 'services', 'finishing'];
  const priorities = ['all', 'critical', 'high', 'medium', 'low'];

  const filtered = tasks.filter(t => {
    if (filterPhase !== 'all' && t.phase !== filterPhase) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addTask({
      ...newTask,
      status: 'todo',
      assignee: { name: newTask.assignee || 'Unassigned', avatar: null },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setNewTask({ title: '', priority: 'medium', phase: 'structure', assignee: '' });
    setShowAddModal(false);
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length,
  };

  return (
    <div className="dash-animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="dash-section-title" style={{ marginBottom: 0 }}>
          <CheckSquare className="dash-section-title-icon" />
          Tasks Management
        </div>
        <button className="dash-btn dash-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus style={{ width: 16, height: 16 }} /> Add Task
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="dash-badge neutral" style={{ padding: '6px 14px', fontSize: 12 }}>
          Total: <strong>{stats.total}</strong>
        </div>
        <div className="dash-badge success" style={{ padding: '6px 14px', fontSize: 12 }}>
          <CheckCircle style={{ width: 12, height: 12 }} /> Done: <strong>{stats.done}</strong>
        </div>
        {stats.overdue > 0 && (
          <div className="dash-badge danger" style={{ padding: '6px 14px', fontSize: 12 }}>
            <AlertCircle style={{ width: 12, height: 12 }} /> Overdue: <strong>{stats.overdue}</strong>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="dash-filters">
        <Filter style={{ width: 14, height: 14, color: 'var(--dash-text-muted)' }} />
        {phases.map(p => (
          <button key={p} className={`dash-filter-btn ${filterPhase === p ? 'active' : ''}`} onClick={() => setFilterPhase(p)}>
            {p === 'all' ? 'All Phases' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--dash-border)', margin: '0 4px' }} />
        {priorities.map(p => (
          <button key={p} className={`dash-filter-btn ${filterPriority === p ? 'active' : ''}`} onClick={() => setFilterPriority(p)}>
            {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="dash-kanban">
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="dash-kanban-col">
              <div className="dash-kanban-col-header">
                <div className="dash-kanban-col-title">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                  {col.label}
                </div>
                <span className="dash-kanban-col-count">{colTasks.length}</span>
              </div>
              <div className="dash-kanban-cards">
                {colTasks.map(task => {
                  const pColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                  const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date();
                  return (
                    <div key={task.id} className="dash-kanban-card">
                      <div className="dash-kanban-card-title">{task.title}</div>
                      <div className="dash-kanban-card-meta">
                        <span className="dash-badge" style={{ background: pColor.bg, color: pColor.color }}>
                          {task.priority}
                        </span>
                        <span style={{
                          fontSize: 11, color: isOverdue ? 'var(--dash-danger)' : 'var(--dash-text-muted)',
                          display: 'flex', alignItems: 'center', gap: 3
                        }}>
                          <Calendar style={{ width: 11, height: 11 }} />
                          {task.dueDate}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%', background: 'var(--dash-accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, color: 'white'
                          }}>
                            {task.assignee?.name?.charAt(0) || '?'}
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>{task.assignee?.name}</span>
                        </div>
                        <span className="dash-badge neutral" style={{ fontSize: 10 }}>{task.phase}</span>
                      </div>
                      
                      {/* Stakeholder Overlays */}
                      {(task.assignedContractorId || task.assignedWorkerIds?.length > 0) && (
                        <div style={{ 
                          borderTop: '1px solid var(--dash-border)', 
                          marginTop: 10, paddingTop: 10, 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                        }}>
                          {task.assignedContractorId && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--dash-text-muted)' }}>
                              <HardHat size={12} className="text-orange-500" />
                              <span className="font-medium text-gray-700 truncate w-24">
                                {contractors?.find(c => c.id === task.assignedContractorId)?.name || 'Contractor'}
                              </span>
                            </div>
                          )}
                          {task.assignedWorkerIds?.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--dash-text-muted)', marginLeft: 'auto' }}>
                              <Users size={12} className="text-blue-500" />
                              <span className="font-medium text-gray-700">
                                {task.assignedWorkerIds.length} Team
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--dash-text-muted)' }}>
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="dash-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">Add New Task</span>
              <button className="dash-modal-close" onClick={() => setShowAddModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="dash-modal-body">
              <div className="dash-input-group">
                <label className="dash-label">Task Title *</label>
                <input className="dash-input" placeholder="e.g., Steel inspection for 9th floor" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="dash-input-group">
                  <label className="dash-label">Priority</label>
                  <select className="dash-select" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">Phase</label>
                  <select className="dash-select" value={newTask.phase} onChange={e => setNewTask({ ...newTask, phase: e.target.value })}>
                    <option value="planning">Planning</option>
                    <option value="structure">Structure</option>
                    <option value="services">Services</option>
                    <option value="finishing">Finishing</option>
                  </select>
                </div>
              </div>
              <div className="dash-input-group">
                <label className="dash-label">Assignee</label>
                <input className="dash-input" placeholder="Worker name" value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })} />
              </div>
            </div>
            <div className="dash-modal-footer">
              <button className="dash-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="dash-btn dash-btn-primary" onClick={handleAddTask}>Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
