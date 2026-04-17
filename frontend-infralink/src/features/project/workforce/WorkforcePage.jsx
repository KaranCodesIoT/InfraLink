import { useState } from 'react';
import { Users, UserCheck, UserX, Clock, Star, Award, Phone, Search } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

const STATUS_MAP = {
  present: { label: 'Present', badge: 'success' },
  absent: { label: 'Absent', badge: 'danger' },
  late: { label: 'Late', badge: 'warning' },
  on_leave: { label: 'On Leave', badge: 'info' },
};

export default function WorkforcePage() {
  const { workers, attendance, workerRoles } = useProjectDashboardStore();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.role.toLowerCase().includes(search.toLowerCase())
  );

  const todayAttendance = attendance[0];
  const activeCount = workers.filter(w => w.status === 'active').length;
  const onLeaveCount = workers.filter(w => w.status === 'on_leave').length;
  const avgPerformance = Math.round(workers.reduce((s, w) => s + w.performance, 0) / workers.length);
  const totalRoleCount = workerRoles.reduce((s, r) => s + r.count, 0);

  return (
    <div className="dash-animate-in">
      <div className="dash-section-title">
        <Users className="dash-section-title-icon" />
        Workforce Management
      </div>

      {/* KPI Row */}
      <div className="dash-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-success)', '--kpi-bg': 'var(--dash-success-subtle)' }}>
          <div className="dash-kpi-icon"><UserCheck style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{activeCount}</div>
          <div className="dash-kpi-label">Active Workers</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-info)', '--kpi-bg': 'var(--dash-info-subtle)' }}>
          <div className="dash-kpi-icon"><Clock style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{onLeaveCount}</div>
          <div className="dash-kpi-label">On Leave</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-warning)', '--kpi-bg': 'var(--dash-warning-subtle)' }}>
          <div className="dash-kpi-icon"><Star style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{avgPerformance}%</div>
          <div className="dash-kpi-label">Avg Performance</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-accent)', '--kpi-bg': 'var(--dash-accent-subtle)' }}>
          <div className="dash-kpi-icon"><Award style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{totalRoleCount}</div>
          <div className="dash-kpi-label">Total Team Size</div>
        </div>
      </div>

      <div className="dash-grid-2" style={{ marginBottom: 24 }}>
        {/* Team Composition */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Team Composition</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workerRoles.map(r => (
              <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--dash-text-secondary)', width: 90 }}>{r.role}</span>
                <div style={{ flex: 1 }}>
                  <div className="dash-progress" style={{ height: 8 }}>
                    <div className="dash-progress-fill" style={{ width: `${(r.count / totalRoleCount) * 100}%`, background: r.color }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-primary)', minWidth: 24, textAlign: 'right' }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Today's Attendance</div>
              <div className="dash-card-subtitle">{todayAttendance?.date}</div>
            </div>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance?.records?.map(rec => {
                  const worker = workers.find(w => w.id === rec.workerId);
                  const st = STATUS_MAP[rec.status] || STATUS_MAP.absent;
                  return (
                    <tr key={rec.workerId}>
                      <td style={{ color: 'var(--dash-text-primary)', fontWeight: 500 }}>{worker?.name || rec.workerId}</td>
                      <td><span className={`dash-badge ${st.badge}`}>{st.label}</span></td>
                      <td>{rec.checkIn || '—'}</td>
                      <td>{rec.checkOut || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="dash-filters">
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--dash-text-muted)' }} />
          <input className="dash-search-input" placeholder="Search workers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className={`dash-filter-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid</button>
        <button className={`dash-filter-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>Table</button>
      </div>

      {/* Worker Cards / Table */}
      {view === 'grid' ? (
        <div className="dash-grid-auto">
          {filtered.map(worker => (
            <div key={worker.id} className="dash-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'var(--dash-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {worker.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dash-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{worker.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--dash-text-muted)' }}>{worker.role}</div>
                </div>
                <span className={`dash-badge ${worker.status === 'active' ? 'success' : 'info'}`}>
                  {worker.status === 'active' ? 'Active' : 'Leave'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '8px 10px', background: 'var(--dash-bg-secondary)', borderRadius: 'var(--dash-radius-sm)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dash-text-primary)' }}>{worker.attendance}%</div>
                  <div style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>Attendance</div>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--dash-bg-secondary)', borderRadius: 'var(--dash-radius-sm)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dash-text-primary)' }}>{worker.performance}%</div>
                  <div style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>Performance</div>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--dash-bg-secondary)', borderRadius: 'var(--dash-radius-sm)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dash-text-primary)' }}>{worker.tasksCompleted}</div>
                  <div style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>Tasks Done</div>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--dash-bg-secondary)', borderRadius: 'var(--dash-radius-sm)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--dash-text-primary)' }}>₹{worker.dailyWage}</div>
                  <div style={{ fontSize: 10, color: 'var(--dash-text-muted)' }}>Daily Wage</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--dash-text-muted)' }}>
                <Phone style={{ width: 12, height: 12 }} />
                {worker.phone}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dash-card">
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Attendance</th>
                  <th>Performance</th>
                  <th>Tasks</th>
                  <th>Hours</th>
                  <th>Wage/Day</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 500, color: 'var(--dash-text-primary)' }}>{w.name}</td>
                    <td>{w.role}</td>
                    <td><span className={`dash-badge ${w.status === 'active' ? 'success' : 'info'}`}>{w.status}</span></td>
                    <td>{w.attendance}%</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="dash-progress" style={{ width: 60, height: 4 }}>
                          <div className={`dash-progress-fill ${w.performance >= 90 ? 'success' : w.performance >= 70 ? '' : 'danger'}`}
                            style={{ width: `${w.performance}%` }} />
                        </div>
                        {w.performance}%
                      </div>
                    </td>
                    <td>{w.tasksCompleted}</td>
                    <td>{w.hoursLogged}h</td>
                    <td>₹{w.dailyWage.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
