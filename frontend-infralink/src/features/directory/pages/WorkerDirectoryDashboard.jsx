import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, Hammer, Package, FileText, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useDirectoryStore } from '../../../store/index.js';

const DIRECTORY_CARDS = [
  {
    id: 'builder',
    label: 'Builders & Developers',
    description: 'Construction companies, property developers, and project managers.',
    icon: Building2,
    gradient: 'from-orange-500 to-orange-600',
    lightBg: 'bg-orange-50',
    lightText: 'text-orange-700',
    borderColor: 'border-orange-200',
    hoverRing: 'hover:ring-orange-400',
  },
  {
    id: 'architect',
    label: 'Architects & Engineers',
    description: 'Design professionals, structural engineers, and MEP consultants.',
    icon: FileText,
    gradient: 'from-purple-500 to-purple-600',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-700',
    borderColor: 'border-purple-200',
    hoverRing: 'hover:ring-purple-400',
  },
  {
    id: 'contractor',
    label: 'Contractors',
    description: 'Sub-contractors and specialized construction teams.',
    icon: Briefcase,
    gradient: 'from-green-500 to-green-600',
    lightBg: 'bg-green-50',
    lightText: 'text-green-700',
    borderColor: 'border-green-200',
    hoverRing: 'hover:ring-green-400',
  },
  {
    id: 'labour',
    label: 'Skilled Labour',
    description: 'Experienced tradespeople: masons, electricians, plumbers, and more.',
    icon: Hammer,
    gradient: 'from-yellow-500 to-yellow-600',
    lightBg: 'bg-yellow-50',
    lightText: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    hoverRing: 'hover:ring-yellow-400',
  },
  {
    id: 'supplier',
    label: 'Material Suppliers',
    description: 'Suppliers of construction materials, equipment, and tools.',
    icon: Package,
    gradient: 'from-teal-500 to-teal-600',
    lightBg: 'bg-teal-50',
    lightText: 'text-teal-700',
    borderColor: 'border-teal-200',
    hoverRing: 'hover:ring-teal-400',
  },
  {
    id: null, // Coming soon
    label: 'Bidding Contracts',
    description: 'Open contract listings and bid requests for projects.',
    icon: Users,
    gradient: 'from-gray-400 to-gray-500',
    lightBg: 'bg-gray-50',
    lightText: 'text-gray-500',
    borderColor: 'border-gray-200',
    hoverRing: '',
    comingSoon: true,
  },
];

export default function WorkerDirectoryDashboard() {
  const navigate = useNavigate();
  const { categoryStats, fetchDirectoryStats, isLoading } = useDirectoryStore();

  useEffect(() => {
    fetchDirectoryStats();
  }, [fetchDirectoryStats]);

  const handleCardClick = (roleId) => {
    if (!roleId) return; // Coming soon
    if (roleId === 'builder') {
      navigate('/directory/builders');
    } else {
      navigate(`/directory/browse?role=${roleId}`);
    }
  };

  const totalProfessionals = Object.values(categoryStats).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Worker Directory</h1>
        <p className="text-gray-500 mt-2 text-base">
          Discover verified construction professionals across all disciplines.
          {!isLoading && totalProfessionals > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
              {totalProfessionals} professionals listed
            </span>
          )}
        </p>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIRECTORY_CARDS.map((card) => {
            const count = card.id ? (categoryStats[card.id] || 0) : null;
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                onClick={() => handleCardClick(card.id)}
                className={`group relative bg-white rounded-2xl border-2 ${card.borderColor} shadow-sm overflow-hidden transition-all duration-200 ${
                  card.comingSoon
                    ? 'opacity-60 cursor-not-allowed'
                    : `cursor-pointer hover:shadow-lg hover:ring-2 ring-offset-1 ${card.hoverRing} hover:-translate-y-0.5`
                }`}
              >
                {/* Gradient accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.lightBg}`}>
                      <Icon className={`w-6 h-6 ${card.lightText}`} />
                    </div>
                    {card.comingSoon ? (
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                        Coming Soon
                      </span>
                    ) : (
                      <span className={`text-2xl font-extrabold ${card.lightText}`}>
                        {count}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{card.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{card.description}</p>

                  {!card.comingSoon && (
                    <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${card.lightText} group-hover:gap-2.5 transition-all`}>
                      Browse {card.label.split(' ')[0]}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Browse All Link */}
      {!isLoading && (
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/directory/browse')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Users className="w-4 h-4" />
            Browse All Professionals
          </button>
        </div>
      )}
    </div>
  );
}
