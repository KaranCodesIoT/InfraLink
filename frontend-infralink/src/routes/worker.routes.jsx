import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';
import RoleRoute from './RoleRoute.jsx';

// Worker Pages
import WorkerDashboard from '../features/dashboard/pages/WorkerDashboard.jsx';

const workerRoutes = [
  {
    element: <RoleRoute roles={[ROLES.WORKER, ROLES.LABOUR]} />,
    children: [
      { path: ROUTES.DASHBOARD, element: <WorkerDashboard /> },
      // Other worker-specific routes
    ],
  },
];

export default workerRoutes;

