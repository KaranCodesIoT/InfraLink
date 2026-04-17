import {
  LayoutDashboard, TrendingUp, Users, AlertTriangle, IndianRupee,
  CalendarDays, CheckSquare, Package, ArrowUpRight, ArrowDownRight,
  Clock, GitBranch, FileText, CalendarClock
} from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

function ProgressRing({ value, size = 140, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="dash-ring">
      <svg width={size} height={size}>
        <circle className="dash-ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <circle
          className="dash-ring-fill"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="dash-ring-text">
        <span className="dash-ring-value">{value}%</span>
        <span className="dash-ring-label">Complete</span>
      </div>
    </div>
  );
}

const ACTIVITY_ICONS = {
  task: CheckSquare,
  issue: AlertTriangle,
  material: Package,
  payment: IndianRupee,
  workforce: Users,
  update: CalendarClock,
  document: FileText,
};

const ACTIVITY_COLORS = {
  task: 'var(--dash-info)',
  issue: 'var(--dash-danger)',
  material: 'var(--dash-warning)',
  payment: 'var(--dash-success)',
  workforce: 'var(--dash-accent)',
  update: 'var(--dash-info)',
  document: 'var(--dash-text-muted)',
};

export default function OverviewPage() {
  const { project, workflow, tasks, workers, issues, finance, activity, dailyUpdates } = useProjectDashboardStore();

  const openIssues = issues.filter(i => i.status === 'open').length;
  const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const daysRemaining = Math.max(0, Math.ceil((new Date(project.expectedCompletion) - new Date()) / (1000 * 60 * 60 * 24)));
  const currentPhase = workflow?.phases?.find(p => p.status === 'active');

  const kpis = [
    { label: 'Overall Progress', value: `${project.progress}%`, icon: TrendingUp, change: '+3.2%', changeDir: 'up', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    { label: 'Budget Spent', value: `₹${(finance?.spent / 10000000).toFixed(1)}Cr`, icon: IndianRupee, change: `${((finance?.spent / finance?.totalBudget) * 100).toFixed(0)}%`, changeDir: 'up', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    { label: 'Active Workers', value: activeWorkers, icon: Users, change: `${workers.length} total`, changeDir: null, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Open Issues', value: openIssues, icon: AlertTriangle, change: issues.filter(i => i.severity === 'critical').length + ' critical', changeDir: openIssues > 0 ? 'down' : null, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { label: 'Days Remaining', value: daysRemaining, icon: CalendarDays, change: project.expectedCompletion, changeDir: null, color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
    { label: 'Tasks Active', value: activeTasks, icon: CheckSquare, change: `${tasks.filter(t => t.status === 'done').length} done`, changeDir: null, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  ];

  return (
    <div className="dash-animate-in">
      {/* KPI Cards */}
      <div className="dash-kpi-grid">
        {kpis.map((kpi, idx) => (
          <div key={kpi.label} className={`dash-kpi dash-animate-in dash-animate-in-${idx + 1}`} style={{ '--kpi-color': kpi.color, '--kpi-bg': kpi.bg }}>
            <div className="dash-kpi-icon">
              <kpi.icon style={{ width: 20, height: 20 }} />
            </div>
            <div className="dash-kpi-value">{kpi.value}</div>
            <div className="dash-kpi-label">{kpi.label}</div>
            {kpi.change && (
              <div className={`dash-kpi-change ${kpi.changeDir || ''}`}>
                {kpi.changeDir === 'up' && <ArrowUpRight style={{ width: 12, height: 12 }} />}
                {kpi.changeDir === 'down' && <ArrowDownRight style={{ width: 12, height: 12 }} />}
                {kpi.change}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="dash-grid-2" style={{ marginBottom: 24 }}>
        {/* Progress Ring + Phase */}
        <div className="dash-card dash-animate-in" style={{ animationDelay: '0.15s' }}>
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Project Progress</div>
              <div className="dash-card-subtitle">Overall completion status</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <ProgressRing value={project.progress} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--dash-text-muted)', marginBottom: 4 }}>Current Phase</div>
                <div className="dash-badge accent" style={{ fontSize: 12, padding: '4px 12px' }}>
                  <GitBranch style={{ width: 12, height: 12 }} />
                  {currentPhase?.label || 'N/A'}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--dash-text-muted)', marginBottom: 4 }}>Floors Completed</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dash-text-primary)' }}>
                  {project.completedFloors} <span style={{ fontSize: 13, color: 'var(--dash-text-muted)', fontWeight: 400 }}>/ {project.totalFloors}</span>
                </div>
              </div>
              <div className="dash-progress" style={{ marginBottom: 6 }}>
                <div className="dash-progress-fill" style={{ width: `${(project.completedFloors / project.totalFloors) * 100}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>
                {((project.completedFloors / project.totalFloors) * 100).toFixed(0)}% floor construction
              </div>
            </div>
          </div>
        </div>

        {/* Phase Progress Overview */}
        <div className="dash-card dash-animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Phase Progress</div>
              <div className="dash-card-subtitle">Construction workflow stages</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {workflow?.phases?.map((phase) => (
              <div key={phase.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: phase.status === 'completed' ? 'var(--dash-success)' : phase.status === 'active' ? 'var(--dash-accent)' : 'var(--dash-text-muted)'
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dash-text-primary)' }}>{phase.label}</span>
                    <span className={`dash-badge ${phase.status === 'completed' ? 'success' : phase.status === 'active' ? 'accent' : 'neutral'}`}>
                      {phase.status === 'completed' ? 'Done' : phase.status === 'active' ? 'Active' : 'Upcoming'}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dash-text-secondary)' }}>{phase.progress}%</span>
                </div>
                <div className="dash-progress">
                  <div
                    className={`dash-progress-fill ${phase.status === 'completed' ? 'success' : ''}`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dash-grid-2">
        {/* Recent Activity */}
        <div className="dash-card dash-animate-in" style={{ animationDelay: '0.25s' }}>
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Recent Activity</div>
              <div className="dash-card-subtitle">Latest events across all modules</div>
            </div>
          </div>
          <div className="dash-timeline">
            {activity.slice(0, 6).map((item) => {
              const Icon = ACTIVITY_ICONS[item.icon] || Clock;
              return (
                <div key={item.id} className="dash-timeline-item">
                  <div
                    className="dash-timeline-dot"
                    style={{ background: ACTIVITY_COLORS[item.icon] || 'var(--dash-accent)' }}
                  />
                  <div className="dash-timeline-time">{item.time}</div>
                  <div className="dash-timeline-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon style={{ width: 14, height: 14, flexShrink: 0, color: ACTIVITY_COLORS[item.icon] }} />
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Daily Update */}
        <div className="dash-card dash-animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="dash-card-header">
            <div>
              <div className="dash-card-title">Latest Site Report</div>
              <div className="dash-card-subtitle">{dailyUpdates[0]?.date || 'No reports yet'}</div>
            </div>
            {dailyUpdates[0] && (
              <div className="dash-badge info">{dailyUpdates[0].weather}</div>
            )}
          </div>
          {dailyUpdates[0] ? (
            <div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--dash-success-subtle)', borderRadius: 'var(--dash-radius-sm)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dash-success)' }}>{dailyUpdates[0].workersPresent}</div>
                  <div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>Present</div>
                </div>
                <div style={{ flex: 1, padding: '12px 16px', background: 'var(--dash-danger-subtle)', borderRadius: 'var(--dash-radius-sm)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--dash-danger)' }}>{dailyUpdates[0].workersAbsent}</div>
                  <div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>Absent</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--dash-text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                {dailyUpdates[0].summary}
              </p>
              <div style={{ fontSize: 12, color: 'var(--dash-text-muted)' }}>
                <span style={{ fontWeight: 500 }}>By:</span> {dailyUpdates[0].author} ({dailyUpdates[0].role})
              </div>
            </div>
          ) : (
            <div className="dash-empty">
              <div className="dash-empty-title">No reports yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
