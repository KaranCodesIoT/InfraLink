import { useState } from 'react';
import { AlertTriangle, Plus, X, ChevronDown, ChevronUp, Filter, Shield, AlertCircle } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

const SEVERITY_MAP = {
  critical: { label: 'Critical', badge: 'danger', icon: '🔴' },
  high: { label: 'High', badge: 'warning', icon: '🟠' },
  medium: { label: 'Medium', badge: 'info', icon: '🔵' },
  low: { label: 'Low', badge: 'neutral', icon: '⚪' },
};

const STATUS_MAP = {
  open: { label: 'Open', badge: 'danger' },
  in_progress: { label: 'In Progress', badge: 'warning' },
  resolved: { label: 'Resolved', badge: 'success' },
};

export default function IssuesPage() {
  const { issues, addIssue, updateIssueStatus } = useProjectDashboardStore();
  const [expandedId, setExpandedId] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', severity: 'medium', phase: 'structure', reporter: '', description: '' });

  const filtered = issues.filter(i => {
    if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newIssue.title.trim()) return;
    addIssue(newIssue);
    setNewIssue({ title: '', severity: 'medium', phase: 'structure', reporter: '', description: '' });
    setShowAddModal(false);
  };

  const criticalCount = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const openCount = issues.filter(i => i.status === 'open').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <div className="dash-animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="dash-section-title" style={{ marginBottom: 0 }}>
          <AlertTriangle className="dash-section-title-icon" />
          Issues & Alerts
        </div>
        <button className="dash-btn dash-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus style={{ width: 16, height: 16 }} /> Report Issue
        </button>
      </div>

      {/* Stats */}
      <div className="dash-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-text-primary)', '--kpi-bg': 'rgba(255,255,255,0.04)' }}>
          <div className="dash-kpi-icon"><AlertCircle style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{issues.length}</div>
          <div className="dash-kpi-label">Total Issues</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-danger)', '--kpi-bg': 'var(--dash-danger-subtle)' }}>
          <div className="dash-kpi-icon"><Shield style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{criticalCount}</div>
          <div className="dash-kpi-label">Critical Active</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-warning)', '--kpi-bg': 'var(--dash-warning-subtle)' }}>
          <div className="dash-kpi-icon"><AlertTriangle style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{openCount}</div>
          <div className="dash-kpi-label">Open</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-success)', '--kpi-bg': 'var(--dash-success-subtle)' }}>
          <div className="dash-kpi-icon"><Shield style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{resolvedCount}</div>
          <div className="dash-kpi-label">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="dash-filters">
        <Filter style={{ width: 14, height: 14, color: 'var(--dash-text-muted)' }} />
        {['all', 'critical', 'high', 'medium', 'low'].map(s => (
          <button key={s} className={`dash-filter-btn ${filterSeverity === s ? 'active' : ''}`} onClick={() => setFilterSeverity(s)}>
            {s === 'all' ? 'All Severity' : SEVERITY_MAP[s].icon + ' ' + SEVERITY_MAP[s].label}
          </button>
        ))}
        <span style={{ width: 1, height: 20, background: 'var(--dash-border)' }} />
        {['all', 'open', 'in_progress', 'resolved'].map(s => (
          <button key={s} className={`dash-filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'All Status' : STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(issue => {
          const sev = SEVERITY_MAP[issue.severity] || SEVERITY_MAP.medium;
          const stat = STATUS_MAP[issue.status] || STATUS_MAP.open;
          const isExpanded = expandedId === issue.id;

          return (
            <div key={issue.id} className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedId(prev => prev === issue.id ? null : issue.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 16 }}>{sev.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dash-text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {issue.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dash-text-muted)' }}>
                    Reported by {issue.reporter} · {issue.reportedAt}
                  </div>
                </div>
                <span className={`dash-badge ${sev.badge}`}>{sev.label}</span>
                <span className={`dash-badge ${stat.badge}`}>{stat.label}</span>
                <span className="dash-badge neutral">{issue.phase}</span>
                {isExpanded ? <ChevronUp style={{ width: 16, height: 16, color: 'var(--dash-text-muted)' }} /> : <ChevronDown style={{ width: 16, height: 16, color: 'var(--dash-text-muted)' }} />}
              </div>

              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--dash-border)', paddingTop: 16, animation: 'dash-fade-in 0.2s ease' }}>
                  <div style={{ fontSize: 13, color: 'var(--dash-text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    <strong style={{ color: 'var(--dash-text-primary)' }}>Description:</strong> {issue.description}
                  </div>
                  {issue.resolution && (
                    <div style={{
                      padding: '10px 14px', background: 'var(--dash-success-subtle)',
                      borderRadius: 'var(--dash-radius-sm)', border: '1px solid rgba(34,197,94,0.2)',
                      fontSize: 13, color: 'var(--dash-success)', lineHeight: 1.5
                    }}>
                      <strong>Resolution:</strong> {issue.resolution}
                    </div>
                  )}
                  {issue.status !== 'resolved' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {issue.status === 'open' && (
                        <button className="dash-btn dash-btn-sm" onClick={() => updateIssueStatus(issue.id, 'in_progress')}>
                          Mark In Progress
                        </button>
                      )}
                      <button className="dash-btn dash-btn-sm dash-btn-primary" onClick={() => updateIssueStatus(issue.id, 'resolved', 'Resolved by team.')}>
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="dash-card">
            <div className="dash-empty">
              <AlertTriangle className="dash-empty-icon" />
              <div className="dash-empty-title">No issues found</div>
              <div className="dash-empty-desc">Adjust filters or report a new issue</div>
            </div>
          </div>
        )}
      </div>

      {/* Add Issue Modal */}
      {showAddModal && (
        <div className="dash-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">Report Issue</span>
              <button className="dash-modal-close" onClick={() => setShowAddModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="dash-modal-body">
              <div className="dash-input-group">
                <label className="dash-label">Issue Title *</label>
                <input className="dash-input" placeholder="Brief description of the issue" value={newIssue.title} onChange={e => setNewIssue({ ...newIssue, title: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="dash-input-group">
                  <label className="dash-label">Severity</label>
                  <select className="dash-select" value={newIssue.severity} onChange={e => setNewIssue({ ...newIssue, severity: e.target.value })}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">Phase</label>
                  <select className="dash-select" value={newIssue.phase} onChange={e => setNewIssue({ ...newIssue, phase: e.target.value })}>
                    <option value="planning">Planning</option>
                    <option value="structure">Structure</option>
                    <option value="services">Services</option>
                    <option value="finishing">Finishing</option>
                  </select>
                </div>
              </div>
              <div className="dash-input-group">
                <label className="dash-label">Reporter</label>
                <input className="dash-input" placeholder="Your name" value={newIssue.reporter} onChange={e => setNewIssue({ ...newIssue, reporter: e.target.value })} />
              </div>
              <div className="dash-input-group">
                <label className="dash-label">Description</label>
                <textarea className="dash-textarea" placeholder="Detailed description of the issue..." value={newIssue.description} onChange={e => setNewIssue({ ...newIssue, description: e.target.value })} />
              </div>
            </div>
            <div className="dash-modal-footer">
              <button className="dash-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="dash-btn dash-btn-primary" onClick={handleAdd}>Submit Issue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
