import { useState } from 'react';
import { CalendarClock, Sun, CloudRain, Users, Plus, X, ChevronDown, ChevronUp, Send, Clipboard } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

export default function DailyUpdatesPage() {
  const { dailyUpdates, addDailyUpdate, workers } = useProjectDashboardStore();
  const [expandedId, setExpandedId] = useState(dailyUpdates[0]?.id || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    author: '',
    role: 'Site Supervisor',
    weather: 'Sunny, 35°C',
    workersPresent: 0,
    workersAbsent: 0,
    summary: '',
    activities: [''],
    issues: [''],
  });

  const handleActivityChange = (idx, val) => {
    const acts = [...newUpdate.activities];
    acts[idx] = val;
    setNewUpdate({ ...newUpdate, activities: acts });
  };

  const handleIssueChange = (idx, val) => {
    const iss = [...newUpdate.issues];
    iss[idx] = val;
    setNewUpdate({ ...newUpdate, issues: iss });
  };

  const handleSubmit = () => {
    if (!newUpdate.summary.trim()) return;
    addDailyUpdate({
      ...newUpdate,
      activities: newUpdate.activities.filter(a => a.trim()),
      issues: newUpdate.issues.filter(i => i.trim()),
      materialsUsed: [],
      images: [],
    });
    setNewUpdate({
      author: '', role: 'Site Supervisor', weather: 'Sunny, 35°C',
      workersPresent: 0, workersAbsent: 0, summary: '', activities: [''], issues: [''],
    });
    setShowAddModal(false);
  };

  return (
    <div className="dash-animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="dash-section-title" style={{ marginBottom: 0 }}>
          <CalendarClock className="dash-section-title-icon" />
          Daily Site Updates
        </div>
        <button className="dash-btn dash-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus style={{ width: 16, height: 16 }} /> New Report
        </button>
      </div>

      {/* Updates Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {dailyUpdates.map(update => {
          const isExpanded = expandedId === update.id;
          return (
            <div key={update.id} className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div
                onClick={() => setExpandedId(prev => prev === update.id ? null : update.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer' }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--dash-radius-md)',
                  background: 'var(--dash-accent-subtle)', color: 'var(--dash-accent)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>
                    {new Date(update.date).getDate()}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase' }}>
                    {new Date(update.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dash-text-primary)', marginBottom: 2 }}>
                    Daily Report — {update.date}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--dash-text-muted)' }}>
                    by {update.author} ({update.role})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="dash-badge info" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sun style={{ width: 11, height: 11 }} /> {update.weather}
                  </div>
                  <div className="dash-badge success">
                    <Users style={{ width: 11, height: 11 }} /> {update.workersPresent}
                  </div>
                  {isExpanded ?
                    <ChevronUp style={{ width: 16, height: 16, color: 'var(--dash-text-muted)' }} /> :
                    <ChevronDown style={{ width: 16, height: 16, color: 'var(--dash-text-muted)' }} />
                  }
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--dash-border)', paddingTop: 16, animation: 'dash-fade-in 0.2s ease' }}>
                  {/* Attendance Summary */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1, padding: '10px 14px', background: 'var(--dash-success-subtle)', borderRadius: 'var(--dash-radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--dash-success)' }}>{update.workersPresent}</div>
                      <div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>Workers Present</div>
                    </div>
                    <div style={{ flex: 1, padding: '10px 14px', background: 'var(--dash-danger-subtle)', borderRadius: 'var(--dash-radius-sm)', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--dash-danger)' }}>{update.workersAbsent}</div>
                      <div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>Workers Absent</div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{
                    padding: '12px 16px', background: 'var(--dash-bg-secondary)',
                    borderRadius: 'var(--dash-radius-sm)', borderLeft: '3px solid var(--dash-accent)',
                    fontSize: 13, color: 'var(--dash-text-secondary)', lineHeight: 1.6, marginBottom: 16
                  }}>
                    {update.summary}
                  </div>

                  {/* Activities */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Activities Completed
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {update.activities.map((act, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '8px 12px', background: 'var(--dash-bg-secondary)',
                          borderRadius: 'var(--dash-radius-sm)', fontSize: 13, color: 'var(--dash-text-secondary)'
                        }}>
                          <Clipboard style={{ width: 13, height: 13, color: 'var(--dash-accent)', marginTop: 2, flexShrink: 0 }} />
                          {act}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issues */}
                  {update.issues?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Issues Encountered
                      </div>
                      {update.issues.map((iss, i) => (
                        <div key={i} style={{
                          padding: '8px 12px', background: 'var(--dash-danger-subtle)',
                          borderRadius: 'var(--dash-radius-sm)', fontSize: 13,
                          color: 'var(--dash-danger)', marginBottom: 6,
                          border: '1px solid rgba(239,68,68,0.15)'
                        }}>
                          ⚠️ {iss}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Materials Used */}
                  {update.materialsUsed?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Materials Used
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {update.materialsUsed.map((mat, i) => (
                          <div key={i} className="dash-badge neutral" style={{ padding: '5px 10px', fontSize: 12 }}>
                            {mat.name}: <strong>{mat.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {dailyUpdates.length === 0 && (
          <div className="dash-card">
            <div className="dash-empty">
              <CalendarClock className="dash-empty-icon" />
              <div className="dash-empty-title">No daily reports yet</div>
              <div className="dash-empty-desc">Submit the first daily site report</div>
            </div>
          </div>
        )}
      </div>

      {/* Add Report Modal */}
      {showAddModal && (
        <div className="dash-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dash-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">New Daily Report</span>
              <button className="dash-modal-close" onClick={() => setShowAddModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="dash-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="dash-input-group">
                  <label className="dash-label">Author</label>
                  <input className="dash-input" placeholder="Your name" value={newUpdate.author} onChange={e => setNewUpdate({ ...newUpdate, author: e.target.value })} />
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">Weather</label>
                  <input className="dash-input" placeholder="e.g. Sunny, 35°C" value={newUpdate.weather} onChange={e => setNewUpdate({ ...newUpdate, weather: e.target.value })} />
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">Workers Present</label>
                  <input className="dash-input" type="number" value={newUpdate.workersPresent} onChange={e => setNewUpdate({ ...newUpdate, workersPresent: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">Workers Absent</label>
                  <input className="dash-input" type="number" value={newUpdate.workersAbsent} onChange={e => setNewUpdate({ ...newUpdate, workersAbsent: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="dash-input-group">
                <label className="dash-label">Daily Summary *</label>
                <textarea className="dash-textarea" rows={3} placeholder="Overall summary of today's work..." value={newUpdate.summary} onChange={e => setNewUpdate({ ...newUpdate, summary: e.target.value })} />
              </div>
              <div className="dash-input-group">
                <label className="dash-label">Activities</label>
                {newUpdate.activities.map((a, i) => (
                  <input key={i} className="dash-input" style={{ marginBottom: 6 }} placeholder={`Activity ${i + 1}`}
                    value={a} onChange={e => handleActivityChange(i, e.target.value)} />
                ))}
                <button className="dash-btn dash-btn-sm" style={{ marginTop: 4 }}
                  onClick={() => setNewUpdate({ ...newUpdate, activities: [...newUpdate.activities, ''] })}>
                  + Add Activity
                </button>
              </div>
              <div className="dash-input-group">
                <label className="dash-label">Issues (optional)</label>
                {newUpdate.issues.map((is, i) => (
                  <input key={i} className="dash-input" style={{ marginBottom: 6 }} placeholder={`Issue ${i + 1}`}
                    value={is} onChange={e => handleIssueChange(i, e.target.value)} />
                ))}
                <button className="dash-btn dash-btn-sm" style={{ marginTop: 4 }}
                  onClick={() => setNewUpdate({ ...newUpdate, issues: [...newUpdate.issues, ''] })}>
                  + Add Issue
                </button>
              </div>
            </div>
            <div className="dash-modal-footer">
              <button className="dash-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="dash-btn dash-btn-primary" onClick={handleSubmit}>
                <Send style={{ width: 14, height: 14 }} /> Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
