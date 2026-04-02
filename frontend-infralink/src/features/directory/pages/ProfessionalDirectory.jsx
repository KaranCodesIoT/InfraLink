import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import { Loader2, Users, Search, MapPin, Star, Building2, Briefcase, FileText, Hammer, Package } from 'lucide-react';
import { ROLES } from '../../../constants/roles.js';

/**
 * Centrally manages browsing for all professional categories.
 * Features advanced filtering by role, location, rating, and name.
 */
export default function ProfessionalDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state management
  const currentRole = searchParams.get('role') || ROLES.BUILDER;
  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location') || '';
  const ratingQuery = searchParams.get('rating') || '';

  const { professionals, fetchProfessionals, isLoading, error } = useDirectoryStore();
  const { toast } = useUIStore();

  useEffect(() => {
    fetchProfessionals({ 
      role: currentRole, 
      search: searchQuery,
      location: locationQuery,
      rating: ratingQuery
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load professionals');
    });
  }, [currentRole, searchQuery, locationQuery, ratingQuery, fetchProfessionals, toast]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const tabs = [
    { id: ROLES.BUILDER, label: 'Builders', icon: Building2 },
    { id: ROLES.CONTRACTOR, label: 'Contractors', icon: Briefcase },
    { id: ROLES.ARCHITECT, label: 'Architects', icon: FileText },
    { id: ROLES.LABOUR, label: 'Skilled Labour', icon: Hammer },
    { id: ROLES.SUPPLIER, label: 'Suppliers', icon: Package },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Professional Directory</h1>
        <p className="text-gray-500 mt-1">Discover and connect with verified infrastructure experts.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-6">
        
        {/* Top Row: Category Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateParam('role', tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                currentRole === tab.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 whitespace-nowrap"
          >
            <Briefcase className="w-4 h-4" />
            Projects
          </button>
        </div>

        {/* Bottom Row: Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Location (City, State)..."
              value={locationQuery}
              onChange={(e) => updateParam('location', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="relative">
            <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={ratingQuery}
              onChange={(e) => updateParam('rating', e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm appearance-none bg-gray-50 focus:bg-white transition-all cursor-pointer font-medium"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-500 mt-4 font-medium animate-pulse">Finding top professionals...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-2xl text-red-700 text-center border border-red-100 font-medium">
          {error}
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No professionals found</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            We couldn't find anyone matching your current filters. Try broadening your search or checking a different location.
          </p>
          <button 
            onClick={() => {
              navigate('/directory/browse');
              setSearchParams({});
            }}
            className="mt-8 text-orange-600 font-bold hover:text-orange-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {professionals.map((prof) => (
            <ProfessionalCard key={prof._id} professional={prof} />
          ))}
        </div>
      )}
    </div>
  );
}
