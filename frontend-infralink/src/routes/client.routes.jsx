import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';
import RoleRoute from './RoleRoute.jsx';

// Client Pages
import ClientDashboard from '../features/dashboard/pages/ClientDashboard.jsx';

const clientRoutes = [
  {
    element: <RoleRoute roles={[ROLES.CLIENT, ROLES.BUILDER, ROLES.NORMAL_USER]} />,
    children: [
      { path: ROUTES.DASHBOARD, element: <ClientDashboard /> },
      // Other client-specific routes can go here
    ],
  },
];

export default clientRoutes;
