import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';

// Layouts & Guards
import PublicLayout from '../layouts/PublicLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

// Public Pages
import Home from '../features/home/pages/Home.jsx';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import RoleSelect from '../features/auth/pages/RoleSelect.jsx';

// Main App Pages
import JobBoard from '../features/jobs/pages/JobBoard.jsx';
import JobDetail from '../features/jobs/pages/JobDetail.jsx';
import JobForm from '../features/jobs/pages/JobForm.jsx';
import Notifications from '../features/notifications/pages/Notifications.jsx';
import Profile from '../features/profile/pages/Profile.jsx';
import ProfessionalDirectory from '../features/directory/pages/ProfessionalDirectory.jsx';
import ProfessionalProfile from '../features/directory/pages/ProfessionalProfile.jsx';


// Route chunks
import clientRoutes from './client.routes.jsx';
import workerRoutes from './worker.routes.jsx';
import adminRoutes from './admin.routes.jsx';
import vendorRoutes from './vendor.routes.jsx';

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.REGISTER, element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: ROUTES.ROLE_SELECT, element: <RoleSelect /> },
      {
        element: <DashboardLayout />,
        children: [
          // Shared routes
          { path: ROUTES.PROFILE, element: <Profile /> },
          { path: ROUTES.NOTIFICATIONS, element: <Notifications /> },
          { path: ROUTES.JOBS, element: <JobBoard /> },
          { path: ROUTES.JOB_DETAIL, element: <JobDetail /> },
          { path: ROUTES.DIRECTORY, element: <ProfessionalDirectory /> },
          { path: ROUTES.DIRECTORY_DETAIL, element: <ProfessionalProfile /> },

          {
            element: <RoleRoute roles={[ROLES.CLIENT, ROLES.BUILDER, ROLES.NORMAL_USER, ROLES.CONTRACTOR]} />,
            children: [
              { path: ROUTES.JOB_POST, element: <JobForm /> },
            ]
          },
          
          // Role specific routes
          ...clientRoutes,
          ...workerRoutes,
          ...vendorRoutes,
          ...adminRoutes,
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.HOME} replace />,
  },
]);

export default router;



