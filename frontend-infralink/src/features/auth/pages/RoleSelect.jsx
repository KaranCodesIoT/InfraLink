import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Hammer, HardHat, Briefcase, HardDriveUpload, Wrench, Package, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { CONTRACTOR_TYPES } from '../../../constants/contractorTypes.js';
import api from '../../../lib/axios.js';

// Individual role — goes straight to dashboard, no profile form
const INDIVIDUAL_ROLE = 'normal_user';

const ROLE_OPTIONS = [
  {
    id: 'normal_user',
    title: 'Individual / Homeowner',
    description: 'Looking to hire professionals for your project.',
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
    description: 'Bidding on projects and managing skilled labour.',
    icon: Briefcase,
    color: 'bg-green-50 text-green-600 border-green-200',
    activeColor: 'ring-green-500 border-green-500',
  },
  {
    id: 'architect',
    title: 'Architect / Engineer',
    description: 'Providing design and structural engineering services.',
    icon: HardDriveUpload,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    activeColor: 'ring-purple-500 border-purple-500',
  },
  {
    id: 'labour',
    title: 'Skilled Labour',
    description: 'Looking for construction jobs and projects to work on.',
    icon: Hammer,
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    activeColor: 'ring-yellow-500 border-yellow-500',
  },
  {
    id: 'supplier',
    title: 'Material Supplier',
    description: 'Supplying construction materials and equipment.',
    icon: Package,
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    activeColor: 'ring-teal-500 border-teal-500',
  },
  {
    id: 'worker',
    title: 'General Worker',
    description: 'Looking for general construction and site work.',
    icon: Wrench,
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    activeColor: 'ring-gray-500 border-gray-500',
  },
];

export default function RoleSelect() {
  const { user, initAuth } = useAuthStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [contractorType, setContractorType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) {
      navigate(ROUTES.DASHBOARD);
      return;
    }

    if (selectedRole === 'contractor' && !contractorType) {
      toast.error('Please select a Contractor Type');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { role: selectedRole };
      if (selectedRole === 'contractor') {
        payload.contractorType = contractorType;
      }

      await api.patch(`/users/${user._id}`, payload);
      await initAuth();

      if (selectedRole === INDIVIDUAL_ROLE) {
        // Individuals skip profile form — go straight to dashboard
        toast.success('Welcome to InfraLink!');
        navigate(ROUTES.DASHBOARD);
      } else {
        // All other professional roles → complete their profile first
        navigate('/complete-profile');
      }
    } catch {
      toast.error('Failed to save role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIndividual = selectedRole === INDIVIDUAL_ROLE;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Progress */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl mb-6 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-medium text-orange-600">Choose Role</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-medium text-gray-400">
              {isIndividual ? 'Dashboard (auto)' : 'Complete Profile'}
            </span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          What's your role on InfraLink?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Choose the option that best describes you. You can always update this from your profile.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative flex flex-col p-5 cursor-pointer rounded-xl border-2 transition-all duration-150 ${
                    isSelected ? role.activeColor + ' ring-1' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-current opacity-90" />
                  )}
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 border ${role.color}`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{role.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>
                  {role.id === INDIVIDUAL_ROLE && (
                    <span className="mt-2 text-xs text-blue-500 font-medium">→ Goes straight to dashboard</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tip for individual role */}
          {isIndividual && (
            <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex items-center gap-2">
              <HardHat className="w-4 h-4 shrink-0" />
              As a homeowner, you'll go straight to the dashboard — no extra steps needed!
            </div>
          )}

          {/* Contractor Type Dropdown */}
          {selectedRole === 'contractor' && (
            <div className="mt-5 p-5 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
              <label className="block text-sm font-bold text-green-900 mb-2">
                Select your Contractor Type *
              </label>
              <select
                value={contractorType}
                onChange={(e) => setContractorType(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-green-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a specialty...</option>
                {CONTRACTOR_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-green-700">This helps clients find you based on your specific expertise.</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={isSubmitting || !selectedRole || (selectedRole === 'contractor' && !contractorType)}
              className="bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Saving...'
                : isIndividual
                  ? 'Continue to Dashboard →'
                  : 'Next: Complete Profile →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
