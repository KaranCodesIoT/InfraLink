<<<<<<< Updated upstream
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import { Loader2, Users, Search, MapPin, Star, Building2, Briefcase, FileText, Hammer, Package } from 'lucide-react';
=======
import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import MarketplaceGrid from '../components/MarketplaceGrid.jsx';
import { Loader2, Users, Search, Star, MapPin, Activity, Package, Briefcase } from 'lucide-react';
>>>>>>> Stashed changes
import { ROLES } from '../../../constants/roles.js';

/**
 * Centrally manages browsing for all professional categories.
 * Features advanced filtering by role, location, rating, and name.
 */
export default function ProfessionalDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

<<<<<<< Updated upstream
  // URL state management
  const currentRole = searchParams.get('role') || ROLES.BUILDER;
=======
  const currentRoleRaw = searchParams.get('role');
  const location = useLocation();
  const isMarketplaceRoute = location.pathname.includes('marketplace');
  
  const currentRole = isMarketplaceRoute ? ROLES.SUPPLIER : (currentRoleRaw || ROLES.CONTRACTOR);
  const [activeTab, setActiveTab] = useState(isMarketplaceRoute ? 'alternate' : 'professionals'); // 'professionals' or 'alternate' (projects/marketplace)

>>>>>>> Stashed changes
  const searchQuery = searchParams.get('q') || '';
  const locationQuery = searchParams.get('location') || '';
  const ratingQuery = searchParams.get('rating') || '';

  const getRoleTitle = (role) => {
    switch(role) {
      case ROLES.CONTRACTOR: return 'Contractors';
      case ROLES.ARCHITECT: return 'Architects & Engineers';
      case ROLES.LABOUR: return 'Skilled Labour';
      case ROLES.SUPPLIER: return 'Material Suppliers';
      case ROLES.BUILDER: return 'Builders & Developers';
      default: return 'Professionals';
    }
  };

  const title = getRoleTitle(currentRole);

  const { professionals, fetchProfessionals, isLoading, error } = useDirectoryStore();
  const { user } = useAuthStore();
  const { toast } = useUIStore();

  // Filter out the current user's profile
  const filteredProfessionals = professionals.filter(prof => prof._id !== user?._id);

  useEffect(() => {
<<<<<<< Updated upstream
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
<<<<<<< Updated upstream
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
