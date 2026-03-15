import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Hammer, HardHat, Briefcase } from 'lucide-react';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';
import api from '../../../lib/axios.js';

const ROLE_OPTIONS = [
  {
    id: 'normal_user',
    title: 'Individual / Homeowner',
    description: 'Looking to hire professionals for a project.',
    icon: HardHat,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    activeColor: 'ring-blue-500 border-blue-500',
  },
  {
    id: 'builder',
    title: 'Builder / Developer',
    description: 'Managing large construction projects and hiring contractors.',
    icon: Building2,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    activeColor: 'ring-orange-500 border-orange-500',
  },
  {
    id: 'contractor',
    title: 'Contractor',
    description: 'Bidding on projects and hiring skilled labor.',
    icon: Briefcase,
    color: 'bg-green-50 text-green-600 border-green-200',
    activeColor: 'ring-green-500 border-green-500',
  },
  {
    id: 'worker',
    title: 'Skilled Worker',
    description: 'Looking for jobs and projects to work on.',
    icon: Hammer,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    activeColor: 'ring-purple-500 border-purple-500',
  },
];

export default function RoleSelect() {
  const { user, initAuth } = useAuthStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'normal_user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (selectedRole === user?.role) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/users/${user._id}`, { role: selectedRole });
      await initAuth(); // Refresh user state
      toast.success('Profile updated successfully!');
      navigate(ROUTES.DASHBOARD);
    } catch {
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          How do you want to use InfraLink?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select your primary role. This determines what you see on your dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative flex flex-col p-6 cursor-pointer rounded-xl border-2 transition-all ${
                    isSelected ? role.activeColor + ' ring-1' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${role.color}`}>
                    <role.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{role.title}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

