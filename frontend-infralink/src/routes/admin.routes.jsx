import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';
import RoleRoute from './RoleRoute.jsx';

// Admin Pages
import AdminDashboard from '../features/dashboard/pages/AdminDashboard.jsx';
import Users from '../features/admin/pages/Users.jsx';
import Analytics from '../features/admin/pages/Analytics.jsx';

const adminRoutes = [
  {
    element: <RoleRoute roles={[ROLES.ADMIN]} />,
    children: [
      { path: ROUTES.DASHBOARD, element: <AdminDashboard /> },
      { path: ROUTES.ADMIN_USERS, element: <Users /> },
      { path: ROUTES.ADMIN_ANALYTICS, element: <Analytics /> },
      // Other admin-specific routes
    ],
  },
];

export default adminRoutes;

