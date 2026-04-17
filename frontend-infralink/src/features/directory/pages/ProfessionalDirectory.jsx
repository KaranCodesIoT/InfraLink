import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import ContractorCard from '../components/ContractorCard.jsx';
import { Loader2, Users, Search, MapPin, Star, HardHat, X, ArrowLeft } from 'lucide-react';

/**
 * Centrally manages browsing for all professional categories.
 * Features advanced filtering by role, location, rating, and name.
 */
export default function ProfessionalDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // If no role specified, default to builder since other roles were removed
  const currentRole = searchParams.get('role') || 'builder';
  const isContractorView = currentRole === 'contractor';

  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location') || '';
  const ratingQuery = searchParams.get('rating') || '';

  // Local state for debounced text inputs (contractor view only)
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localLocation, setLocalLocation] = useState(locationQuery);
  const debounceRef = useRef(null);

  const { professionals, fetchProfessionals, isLoading, error } = useDirectoryStore();
  const { user } = useAuthStore();
  const { toast } = useUIStore();

  // ─── Debounce helpers (contractor view) ──────────────────────────────────
  const updateParam = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!isContractorView) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam('q', localSearch);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isContractorView) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam('location', localLocation);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [localLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local state when URL params are cleared externally
  useEffect(() => {
    if (isContractorView) {
      setLocalSearch(searchQuery);
      setLocalLocation(locationQuery);
    }
  }, [searchQuery, locationQuery, isContractorView]);

  // ─── Fetch professionals whenever URL params change ───────────────────────
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
=======
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
    const params = { role: currentRole };
    if (searchQuery) params.search = searchQuery;
    if (currentRating) params.rating = currentRating;
    if (currentLocation) params.location = currentLocation;

    fetchProfessionals(params).catch(err => {
      toast.error('Failed to load professionals');
    });
  }, [searchQuery, currentRating, currentLocation, currentRole, fetchProfessionals, toast]);
>>>>>>> Stashed changes

  const clearFilters = () => {
    setLocalSearch('');
    setLocalLocation('');
    setSearchParams({ role: 'contractor' }, { replace: true });
  };

  const hasActiveFilters = searchQuery || locationQuery || ratingQuery;

  // ─── CONTRACTOR-ONLY VIEW ─────────────────────────────────────────────────
  if (isContractorView) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110 active:scale-95 group"
            title="Go Back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-200">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contractor Directory</h1>
              <p className="text-gray-500 text-sm">
                Find and connect with trusted contractors across specialities.
                {!isLoading && professionals.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                    {professionals.length} found
                  </span>
                )}
              </p>
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
                <option value="4.5">4.5★ &amp; above</option>
                <option value="4.0">4.0★ &amp; above</option>
                <option value="3.5">3.5★ &amp; above</option>
                <option value="3.0">3.0★ &amp; above</option>
              </select>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-500 font-medium">
                Showing filtered results
                {!isLoading && (
                  <span className="ml-1 text-orange-600">({professionals.length} found)</span>
                )}
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

  // ─── DEFAULT VIEW (builders, labour, architects, etc.) ────────────────────────────
  const isLabourView = currentRole === 'labour';
  const isArchitectView = currentRole === 'architect';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110 active:scale-95 group"
          title="Go Back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professional Directory</h1>
          <p className="text-gray-500 mt-1">Connect with trusted construction professionals across categories.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-5">

        {/* Top Row: Tabs */}
        {isArchitectView ? (
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
            <button
              onClick={() => updateParam('role', 'architect')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-orange-500 text-white shadow-md shadow-orange-200"
            >
              Architects &amp; Engineers
            </button>
          </div>
        ) : isLabourView ? (
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
            <button
              onClick={() => updateParam('role', 'labour')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-orange-500 text-white shadow-md shadow-orange-200"
            >
              Skilled Labour
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-4">
            <button
              onClick={() => updateParam('role', 'builder')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                currentRole === 'builder'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Builders &amp; Developers
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-gray-600 hover:bg-gray-100"
            >
              Projects
            </button>
          </div>
        )}

        {/* Bottom Row: Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={isArchitectView ? "Search by name or profession type..." : isLabourView ? "Search by name or skill..." : "Search by name..."}
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
=======
      <div className="mb-8 block md:flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Professional Directory</h1>
          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">Connect with trusted construction professionals across categories.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Tabs View */}
          <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
            <button
               onClick={() => setActiveTab('professionals')}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                 activeTab === 'professionals' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
               }`}
            >
              {currentRole === ROLES.SUPPLIER && <Package className="w-4 h-4" />}
              {currentRole === ROLES.BUILDER && <Activity className="w-4 h-4" />}
              {getRoleTitle(currentRole)}
            </button>
            <button
               onClick={() => setActiveTab('alternate')}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                 activeTab === 'alternate' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
               }`}
            >
              <Briefcase className="w-4 h-4" />
              {currentRole === ROLES.SUPPLIER ? 'Material Marketplace' : 'Construction Projects'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 max-w-3xl lg:justify-end">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'professionals' ? title.toLowerCase() : 'projects'}...`}
                value={localSearch}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium transition-all"
              />
            </div>
            <div className="relative w-full md:w-48">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={currentRating}
                onChange={handleRatingChange}
                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-bold appearance-none transition-all"
              >
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>

      {isLoading ? (
<<<<<<< Updated upstream
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-500 mt-4 font-medium animate-pulse">Finding top professionals...</p>
=======
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
          <p className="text-gray-500 mt-4">Finding {title.toLowerCase()}...</p>
>>>>>>> Stashed changes
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-2xl text-red-700 text-center border border-red-100 font-medium">
          {error}
        </div>
<<<<<<< Updated upstream
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
=======
      ) : activeTab === 'professionals' ? (
        filteredProfessionals.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No {title.toLowerCase()} found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfessionals.map((prof) => (
              <ProfessionalCard key={prof._id} professional={prof} />
            ))}
          </div>
        )
      ) : currentRole === ROLES.SUPPLIER ? (
        <MarketplaceGrid professionals={filteredProfessionals} isLoading={isLoading} />
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
           <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-gray-900">No Projects Found</h3>
           <p className="text-gray-500 mt-1">Visit the Builders Directory to add new projects.</p>
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}
