import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';
import RoleRoute from './RoleRoute.jsx';

// Vendor Pages
import VendorDashboard from '../features/dashboard/pages/VendorDashboard.jsx';

const vendorRoutes = [
  {
    element: <RoleRoute roles={[ROLES.CONTRACTOR, ROLES.ARCHITECT, ROLES.SUPPLIER]} />,
    children: [
      { path: ROUTES.DASHBOARD, element: <VendorDashboard /> },
      // Other vendor-specific routes
    ],
  },
];

export default vendorRoutes;

