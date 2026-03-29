import React from 'react';
import useAuth from '../../../hooks/useAuth.js';
import { ROLES } from '../../../constants/roles.js';
import ClientDashboard from './ClientDashboard.jsx';
import WorkerDashboard from './WorkerDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

/**
 * Centrally manages which dashboard variant to show based on user role.
 * Prevents redirect loops and ensures proper view for all professional roles.
 */
export default function RoleDashboardRouter() {
  const { role } = useAuth();

  // Roles that see the Worker/Labour dashboard
  const isWorkerRole = [
    ROLES.WORKER, 
    ROLES.LABOUR, 
  ].includes(role);

  if (role === ROLES.ADMIN) {
    return <AdminDashboard />;
  }

  if (isWorkerRole) {
    return <WorkerDashboard />;
  }

  // Everyone else (Client, Builder, Homeowner, Supplier, etc.) sees the Client dashboard
  return <ClientDashboard />;
}
