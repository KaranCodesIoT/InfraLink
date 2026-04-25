import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Hammer, HardHat, Briefcase, HardDriveUpload, Wrench, Package, Check, Loader2 } from 'lucide-react';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { CONTRACTOR_TYPES } from '../../../constants/contractorTypes.js';

// Individual role — goes straight to dashboard, no profile form
const INDIVIDUAL_ROLE = 'normal_user';

const ROLE_OPTIONS = [
  {
    id: 'normal_user',
    title: 'Individual / Homeowner',
    description: 'Looking to hire professionals for your home project.',
    icon: HardHat,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    activeColor: 'ring-blue-500 border-blue-500',
    badge: 'Hire Pros'
  },
  {
    id: 'builder',
    title: 'Builder / Developer',
    description: 'Manage projects, track site progress and hire teams.',
    icon: Building2,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    activeColor: 'ring-orange-500 border-orange-500',
    badge: 'Manage Projects'
  },
  {
    id: 'contractor',
    title: 'Contractor',
    description: 'Hire workers, manage labour and bid on projects.',
    icon: Briefcase,
    color: 'bg-green-50 text-green-600 border-green-200',
    activeColor: 'ring-green-500 border-green-500',
    badge: 'Hire Workers'
  },
  {
    id: 'architect',
    title: 'Architect / Engineer',
    description: 'Provide professional design and engineering services.',
    icon: HardDriveUpload,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    activeColor: 'ring-purple-500 border-purple-500',
    badge: 'Design'
  },
  {
    id: 'labour',
    title: 'Skilled Labour',
    description: 'Find daily jobs and long-term construction work.',
    icon: Hammer,
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    activeColor: 'ring-yellow-500 border-yellow-500',
    badge: 'Find Jobs'
  },
  {
    id: 'supplier',
    title: 'Material Supplier',
    description: 'Sell construction materials and equipment.',
    icon: Package,
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    activeColor: 'ring-teal-500 border-teal-500',
    badge: 'Sell Materials'
  },
];

export default function RoleSelect() {
  const { user, updateRole } = useAuthStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [contractorType, setContractorType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isIndividual = selectedRole === INDIVIDUAL_ROLE;

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

      await updateRole(payload);

      if (selectedRole === INDIVIDUAL_ROLE) {
        // Individuals skip profile form — go straight to dashboard
        toast.success('Welcome to InfraLink!');
        navigate(ROUTES.DASHBOARD);
      } else if (selectedRole === 'builder') {
        navigate('/builder-onboarding');
      } else if (selectedRole === 'contractor') {
        navigate('/contractor-onboarding');
      } else if (selectedRole === 'supplier') {
        navigate('/supplier-onboarding');
      } else {
        // All other remaining roles → complete generic profile
        navigate('/complete-profile');
      }
    } catch {
      toast.error('Failed to save role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {ROLE_OPTIONS.map((option) => {
              const isSelected = selectedRole === option.id;
              return (
                <button
                key={option.id}
                onClick={() => setSelectedRole(option.id)}
                className={`group relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-xl ${
                  selectedRole === option.id
                    ? `${option.activeColor} bg-white shadow-lg scale-[1.02]`
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${option.color} group-hover:scale-110 transition-transform`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  {option.badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${option.color}`}>
                      {option.badge}
                    </span>
                  )}
                </div>
                
                <h3 className={`text-lg font-bold mb-2 ${selectedRole === option.id ? 'text-gray-900' : 'text-gray-800'}`}>
                  {option.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {option.description}
                </p>

                {selectedRole === option.id && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-orange-600 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>);
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
