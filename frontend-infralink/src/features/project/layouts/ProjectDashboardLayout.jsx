import { useEffect, useState } from 'react';
import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, LayoutDashboard, GitBranch, CheckSquare, Users,
  Package, Wallet, AlertTriangle, FileText, CalendarClock,
  ArrowLeft, ChevronRight, Menu, X, Bell, Search
} from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';
import { ProjectDashboardProvider } from '../context/ProjectDashboardContext.jsx';
import '../styles/project-dashboard.css';

const NAV_SECTIONS = [
  {
    title: 'Management',
    items: [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
      { key: 'workflow', label: 'Workflow', icon: GitBranch, path: '/workflow' },
      { key: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
      { key: 'teams', label: 'Teams', icon: Users, path: '/teams' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { key: 'materials', label: 'Materials', icon: Package, path: '/materials' },
      { key: 'finance', label: 'Finance', icon: Wallet, path: '/finance' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { key: 'issues', label: 'Issues', icon: AlertTriangle, path: '/issues' },
      { key: 'updates', label: 'Daily Updates', icon: CalendarClock, path: '/updates' },
      { key: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
    ]
  },
];

// Flatten to get the current tab key from pathname
function getActiveKey(pathname, baseUrl) {
  const suffix = pathname.replace(baseUrl, '');
  if (!suffix || suffix === '/') return 'overview';
  const clean = suffix.startsWith('/') ? suffix.slice(1) : suffix;
  return clean.split('/')[0] || 'overview';
}

// Map key to human-readable label
function getTabLabel(key) {
  for (const section of NAV_SECTIONS) {
    const item = section.items.find(i => i.key === key);
    if (item) return item.label;
  }
  return 'Overview';
}

export default function ProjectDashboardLayout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    project, isLoading, loadDashboardData, issues,
    simulatorRole, setSimulatorRole
  } = useProjectDashboardStore();

  useEffect(() => {
    if (id) {
      loadDashboardData(id);
    }
  }, [id, loadDashboardData]);

  const baseUrl = `/project/${id}/dashboard`;
  const activeKey = getActiveKey(location.pathname, baseUrl);
  const openIssuesCount = issues.filter(i => i.status === 'open').length;

  if (isLoading || !project) {
    return (
      <div className="project-dashboard" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid rgba(249,115,22,0.3)',
            borderTopColor: '#f97316', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: 'var(--dash-text-muted)', fontSize: 13 }}>Loading project dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <ProjectDashboardProvider value={{ project, projectId: id, role: simulatorRole }}>
      <div className="project-dashboard">
        {/* ── Mobile Overlay ── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              zIndex: 45, display: 'none',
            }}
            className="dash-mobile-overlay"
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="dash-sidebar-header">
            <Link to="/projects" className="dash-sidebar-brand">
              <div className="dash-sidebar-brand-icon">
                <Building2 style={{ width: 18, height: 18 }} />
              </div>
              <span className="dash-sidebar-brand-text">InfraLink</span>
            </Link>
            <div className="dash-project-name" title={project.projectName}>
              {project.projectName}
            </div>
          </div>

          <nav className="dash-sidebar-nav">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="dash-nav-section">{section.title}</div>
                {section.items.map((item) => {
                  const isActive = activeKey === item.key;
                  return (
                    <Link
                      key={item.key}
                      to={`${baseUrl}${item.path}`}
                      className={`dash-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="dash-nav-icon" />
                      <span>{item.label}</span>
                      {item.key === 'issues' && openIssuesCount > 0 && (
                        <span className="dash-nav-badge">{openIssuesCount}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="dash-sidebar-footer">
            <Link to={`/builder-projects/${id}`} className="dash-back-link">
              <ArrowLeft style={{ width: 16, height: 16 }} />
              <span>Back to Project</span>
            </Link>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="dash-main">
          {/* Topbar */}
          <header className="dash-topbar">
            <div className="dash-topbar-left">
              <button
                className="dash-mobile-toggle"
                onClick={() => setSidebarOpen(o => !o)}
              >
                {sidebarOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
              </button>
              <div className="dash-breadcrumb">
                <span>{project.projectName}</span>
                <ChevronRight className="dash-breadcrumb-separator" style={{ width: 14, height: 14 }} />
                <span className="dash-breadcrumb-current">{getTabLabel(activeKey)}</span>
              </div>
            </div>
            <div className="dash-topbar-right">
              {/* ROLE SIMULATOR (For testing interactive flows) */}
              <div className="flex items-center gap-2 mr-4 bg-gray-100 rounded-md p-1 border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 px-2 uppercase tracking-wide">Simulate Role:</span>
                <select 
                  className="text-sm bg-white border border-gray-200 text-gray-700 rounded px-2 py-1 outline-none cursor-pointer"
                  value={simulatorRole || 'builder'}
                  onChange={(e) => setSimulatorRole(e.target.value)}
                >
                  <option value="builder">Builder</option>
                  <option value="contractor">Contractor</option>
                  <option value="architect">Architect</option>
                </select>
              </div>

              <div className="dash-badge accent" style={{ fontSize: 11, padding: '4px 12px' }}>
                {project.status}
              </div>
              <div className="dash-badge info" style={{ fontSize: 11, padding: '4px 12px' }}>
                Phase: {project.currentPhase?.charAt(0).toUpperCase() + project.currentPhase?.slice(1)}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="dash-content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile overlay style injection */}
      <style>{`
        @media (max-width: 768px) {
          .dash-mobile-overlay { display: block !important; }
        }
      `}</style>
    </ProjectDashboardProvider>
  );
}
