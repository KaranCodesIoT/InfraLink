import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import { Loader2, Users, Search, MapPin, Star } from 'lucide-react';
import { ROLES } from '../../../constants/roles.js';

export default function ProfessionalDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // If no role specified, default to builder since other roles were removed
  const currentRole = searchParams.get('role') || 'builder';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Professional Directory</h1>
        <p className="text-gray-500 mt-1">Connect with trusted construction professionals across categories.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-5">
        
        {/* Top Row: Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
          <button
            onClick={() => updateParam('role', 'builder')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              currentRole === 'builder'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Builders & Developers
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-gray-600 hover:bg-gray-100"
          >
            Projects
          </button>
        </div>

        {/* Bottom Row: Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location..."
              value={locationQuery}
              onChange={(e) => updateParam('location', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition-all"
            />
          </div>

          <div className="relative">
            <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={ratingQuery}
              onChange={(e) => updateParam('rating', e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm appearance-none bg-white transition-all cursor-pointer"
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
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-gray-500 mt-4 font-medium">Finding professionals...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-xl text-red-700 text-center border border-red-100 font-medium">
          {error}
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No professionals found</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">We couldn't find anyone matching your current filters. Try adjusting your search query, location, or rating.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {professionals.map((prof) => (
            <ProfessionalCard key={prof._id} professional={prof} />
          ))}
        </div>
      )}
    </div>
  );
}
