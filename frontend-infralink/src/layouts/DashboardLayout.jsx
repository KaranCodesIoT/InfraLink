import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, LayoutDashboard, Briefcase, MessageSquare, Bell,
  User, Settings, LogOut, Menu, X, Search, ChevronDown,
  Wrench, Package, Cpu, Star, ShoppingBag, FolderOpen,
  CreditCard, Bot, Users, BarChart2, PlusCircle, Heart
} from 'lucide-react';
import { ROUTES } from '../constants/routes.js';
import useAuth from '../hooks/useAuth.js';
import useNotificationStore from '../store/notification.store.js';
import useUIStore from '../store/ui.store.js';
import { ROLES } from '../constants/roles.js';
import { resolveAvatarUrl } from '../utils/avatarUrl.js';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD, roles: '*' },
  { label: 'Jobs', icon: Briefcase, path: ROUTES.JOBS, roles: '*' },
  { label: 'Projects', icon: FolderOpen, path: ROUTES.PROJECTS, roles: '*' },
  { label: 'Post Project', icon: PlusCircle, path: ROUTES.POST_BUILDER_PROJECT, roles: [ROLES.BUILDER] },
  { label: 'Messages', icon: MessageSquare, path: ROUTES.MESSAGES, roles: '*' },
  { label: 'Workers', icon: Users, path: ROUTES.WORKERS, roles: [ROLES.BUILDER, ROLES.CONTRACTOR, ROLES.NORMAL_USER, ROLES.CLIENT, ROLES.ADMIN] },
  { label: 'Marketplace', icon: ShoppingBag, path: ROUTES.MARKETPLACE, roles: '*' },
  { label: 'Equipment', icon: Cpu, path: ROUTES.EQUIPMENT, roles: '*' },
  { label: 'Services', icon: Wrench, path: ROUTES.SERVICES, roles: '*' },
  { label: 'Payments', icon: CreditCard, path: ROUTES.PAYMENTS, roles: '*' },
  { label: 'Reviews', icon: Star, path: ROUTES.REVIEWS, roles: '*' },
  { label: 'Favorites', icon: Heart, path: ROUTES.FAVORITES, roles: '*' },
  { label: 'AI Assistant', icon: Bot, path: ROUTES.AI_ASSISTANT, roles: '*' },
  { label: 'Analytics', icon: BarChart2, path: ROUTES.ADMIN_ANALYTICS, roles: [ROLES.ADMIN] },
  { label: 'Manage Users', icon: Users, path: ROUTES.ADMIN_USERS, roles: [ROLES.ADMIN] },
];

export default function DashboardLayout() {
  const { user, logout, role } = useAuth();
  const { unreadCount } = useNotificationStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.roles === '*' || item.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out shrink-0 flex-shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-4 border-b border-gray-700">
          <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <span className="text-lg font-bold text-white">InfraLink</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Search shortcut */}
        {sidebarOpen && (
          <Link
            to={ROUTES.SEARCH}
            className="mx-2 mb-2 flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg text-gray-400 text-sm hover:bg-gray-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search...</span>
          </Link>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={resolveAvatarUrl(user?.avatar)} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                  <Link
                    to={ROUTES.PROFILE}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link
                    to={ROUTES.PROFILE_EDIT}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <hr className="border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

