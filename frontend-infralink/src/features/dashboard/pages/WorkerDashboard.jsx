import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { Hammer, Star, CheckCircle, TrendingUp } from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Active Jobs', value: 2, icon: Hammer, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed', value: 15, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Earnings', value: '₹45k', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rating', value: '4.8', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name}</h1>
          <p className="text-gray-500">Ready for your next shift?</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.JOBS}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Find New Jobs
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Current Assignments</h2>
          <Link to={ROUTES.JOBS} className="text-orange-600 hover:text-orange-700 text-sm font-medium">View all</Link>
        </div>
        <div className="p-6 text-center text-gray-500 py-12">
          You don't have any active job assignments.
        </div>
      </div>
    </div>
  );
}
