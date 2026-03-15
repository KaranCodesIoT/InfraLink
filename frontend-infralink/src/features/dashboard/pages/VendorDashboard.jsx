import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { Briefcase, Building2, Wrench, IndianRupee } from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Active Projects', value: 4, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Open Bids', value: 7, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Workers Assigned', value: 24, icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'This Month Revenue', value: '₹1.2M', icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-500">Manage your projects, team, and bids.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.JOBS}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Find New Projects
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
          <h2 className="text-lg font-bold text-gray-900">Recent Bids</h2>
          <Link to={ROUTES.JOBS} className="text-orange-600 hover:text-orange-700 text-sm font-medium">View all</Link>
        </div>
        <div className="p-6 text-center text-gray-500 py-12">
          You haven't placed any bids recently.
        </div>
      </div>
    </div>
  );
}
