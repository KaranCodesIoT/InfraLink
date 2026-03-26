import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-500 max-w-md mb-6">
        Only verified builders can post projects on InfraLink. If you're a builder,
        please update your profile role to gain access.
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
