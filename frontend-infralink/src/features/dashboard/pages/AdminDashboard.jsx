import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { Users, Briefcase, Activity, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Total Users', value: 1248, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Jobs', value: 432, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Reports', value: 14, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500">System overview and management ({user?.email})</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ADMIN_ANALYTICS}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            View Full Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-12 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">User Growth</h3>
          <p className="text-gray-500 text-sm">Analytics component placeholder.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-12 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Platform Revenue</h3>
          <p className="text-gray-500 text-sm">Revenue component placeholder.</p>
        </div>
      </div>
    </div>
  );
}
