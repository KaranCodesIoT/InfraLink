
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import { Loader2, Building2, Search, Star, MapPin, Activity } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export default function BuilderDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
  const [localLocation, setLocalLocation] = useState(searchParams.get('location') || '');

  const searchQuery = searchParams.get('q') || '';
  const currentRating = searchParams.get('rating') || '';
  const currentLocation = searchParams.get('location') || '';

  const { professionals, fetchProfessionals, isLoading, error } = useDirectoryStore();
  const { user } = useAuthStore();
  const { toast } = useUIStore();

  // Filter out the current user's profile
  const filteredProfessionals = professionals.filter(prof => prof._id !== user?._id);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (localSearch) newParams.set('q', localSearch);
        else newParams.delete('q');

        if (localLocation) newParams.set('location', localLocation);
        else newParams.delete('location');
        return newParams;
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localSearch, localLocation, setSearchParams]);

  useEffect(() => {
    const params = { role: 'builder' };
    if (searchQuery) params.search = searchQuery;
    if (currentRating) params.rating = currentRating;
    if (currentLocation) params.location = currentLocation;

    fetchProfessionals(params).catch(() => {
      toast.error('Failed to load builders');
    });
  }, [searchQuery, currentRating, currentLocation, fetchProfessionals, toast]);

  const handleSearch = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocalLocation(e.target.value);
  };

  const handleRatingChange = (e) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('rating', value);
    else newParams.delete('rating');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Builders & Developers</h1>
          </div>
          <p className="text-gray-500 text-sm">Find verified builders, construction companies, and property developers.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            Builder and Developer
          </button>
          <Link 
            to={ROUTES.PROJECTS}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all shadow-md shadow-orange-100"
          >
            <Activity className="w-4 h-4" />
            Real Time Project
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, or skill..."
              value={localSearch}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Location..."
              value={localLocation}
              onChange={handleLocationChange}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          <div className="relative md:w-48">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={currentRating}
              onChange={handleRatingChange}
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm appearance-none"
            >
              <option value="">Any Rating</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
          <p className="text-gray-500 mt-4">Finding builders...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
          {error}
        </div>
      ) : filteredProfessionals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No builders found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfessionals.map((prof) => (
            <ProfessionalCard key={prof._id} professional={prof} />
          ))}
        </div>
      )}
    </div>
  );
}
