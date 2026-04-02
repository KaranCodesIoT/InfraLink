import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import ContractorCard from '../components/ContractorCard.jsx';
import { Loader2, Users, Search, MapPin, Star, HardHat, X } from 'lucide-react';

export default function ContractorDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL
  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location') || '';
  const ratingQuery = searchParams.get('rating') || '';

  // Local input states for debouncing
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localLocation, setLocalLocation] = useState(locationQuery);
  const debounceRef = useRef(null);

  const { professionals, fetchProfessionals, isLoading, error } = useDirectoryStore();
  const { toast } = useUIStore();

  // Debounced param update
  const updateParam = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    // Always ensure role=contractor
    newParams.set('role', 'contractor');
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Debounce text inputs
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam('q', localSearch);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam('location', localLocation);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [localLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch contractors whenever URL params change
  useEffect(() => {
    fetchProfessionals({
      role: 'contractor',
      search: searchQuery,
      location: locationQuery,
      rating: ratingQuery
    }).catch(() => {
      toast.error('Failed to load contractors');
    });
  }, [searchQuery, locationQuery, ratingQuery, fetchProfessionals, toast]);

  const clearFilters = () => {
    setLocalSearch('');
    setLocalLocation('');
    setSearchParams({ role: 'contractor' }, { replace: true });
  };

  const hasActiveFilters = searchQuery || locationQuery || ratingQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-200">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contractor Directory</h1>
            <p className="text-gray-500 text-sm">Find and connect with trusted contractors across specialities.</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Name / Type */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or type (e.g. Plumber, Mason)..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location..."
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={ratingQuery}
              onChange={(e) => updateParam('rating', e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm appearance-none bg-white transition-all cursor-pointer"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5★ & above</option>
              <option value="4.0">4.0★ & above</option>
              <option value="3.5">3.5★ & above</option>
              <option value="3.0">3.0★ & above</option>
            </select>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-500 font-medium">
              Showing filtered results
              {!isLoading && <span className="ml-1 text-orange-600">({professionals.length} found)</span>}
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-gray-500 mt-4 font-medium">Finding contractors...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-5 rounded-2xl text-red-700 text-center border border-red-100 font-medium">
          {error}
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No contractors found</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">
            We couldn't find any contractors matching your filters. Try adjusting your search or clearing the filters.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {professionals.map((contractor) => (
            <ContractorCard key={contractor._id} contractor={contractor} />
          ))}
        </div>
      )}
    </div>
  );
}
