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
import PostJob from '../features/jobs/pages/PostJob.jsx';
import Notifications from '../features/notifications/pages/Notifications.jsx';
import Profile from '../features/profile/pages/Profile.jsx';
import EditProfile from '../features/profile/pages/EditProfile.jsx';
import ProfessionalDirectory from '../features/directory/pages/ProfessionalDirectory.jsx';
import ProfessionalProfile from '../features/directory/pages/ProfessionalProfile.jsx';
import WorkerDirectoryDashboard from '../features/directory/pages/WorkerDirectoryDashboard.jsx';
import CompleteProfile from '../features/auth/pages/CompleteProfile.jsx';
import BuilderOnboarding from '../features/builders/pages/BuilderOnboarding.jsx';
import ContractorOnboarding from '../features/contractors/pages/ContractorOnboarding.jsx';
import ContractorProfile from '../features/directory/pages/ContractorProfile.jsx';
import BuilderDirectory from '../features/directory/pages/BuilderDirectory.jsx';
import BuilderProfile from '../features/directory/pages/BuilderProfile.jsx';
import Messages from '../features/messaging/pages/Messages.jsx';
import NetworkHub from '../features/network/pages/NetworkHub.jsx';
import PublicProfile from '../features/profile/pages/PublicProfile.jsx';
import MyJobs from '../features/jobs/pages/MyJobs.jsx';
import MyApplications from '../features/jobs/pages/MyApplications.jsx';
import PostBuilderProject from '../features/builderProjects/pages/PostBuilderProject.jsx';
import BuilderProjectDetail from '../features/builderProjects/pages/BuilderProjectDetail.jsx';
import FavoriteProjects from '../features/builderProjects/pages/FavoriteProjects.jsx';
import Projects from '../features/builderProjects/pages/Projects.jsx';

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
      { path: '/complete-profile', element: <CompleteProfile /> },
      { path: '/builder-onboarding', element: <BuilderOnboarding /> },
      { path: '/contractor-onboarding', element: <ContractorOnboarding /> },
      {
        element: <DashboardLayout />,
        children: [
          // Shared routes
          { path: ROUTES.PROFILE, element: <Profile /> },
          { path: '/profile/:id', element: <PublicProfile /> },
          { path: ROUTES.PROFILE_EDIT, element: <EditProfile /> },
          { path: '/network', element: <NetworkHub /> },
          { path: ROUTES.NOTIFICATIONS, element: <Notifications /> },
          { path: ROUTES.MESSAGES, element: <Messages /> },
          { path: ROUTES.MESSAGE_THREAD, element: <Messages /> },
          { path: ROUTES.JOBS, element: <JobBoard /> },
          { path: ROUTES.JOB_DETAIL, element: <JobDetail /> },
          { path: ROUTES.JOB_POST, element: <PostJob /> },
          { path: ROUTES.MY_JOBS, element: <MyJobs /> },
          { path: ROUTES.MY_APPLICATIONS, element: <MyApplications /> },
          { path: ROUTES.DIRECTORY, element: <WorkerDirectoryDashboard /> },
          { path: '/directory/browse', element: <ProfessionalDirectory /> },
          { path: ROUTES.DIRECTORY_DETAIL, element: <ProfessionalProfile /> },
          { path: '/directory/contractor/:id', element: <ContractorProfile /> },
          { path: '/directory/builders', element: <BuilderDirectory /> },
          { path: '/directory/builder/:id', element: <BuilderProfile /> },
          { path: ROUTES.PROJECTS, element: <Projects /> },
          { path: ROUTES.POST_BUILDER_PROJECT, element: <PostBuilderProject /> },
          { path: '/builder-projects/:id', element: <BuilderProjectDetail /> },
          { path: ROUTES.FAVORITES, element: <FavoriteProjects /> },


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



