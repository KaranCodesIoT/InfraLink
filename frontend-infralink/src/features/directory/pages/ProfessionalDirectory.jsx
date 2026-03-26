import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import ProfessionalCard from '../components/ProfessionalCard.jsx';
import BuilderProjectList from '../../builderProjects/components/BuilderProjectList.jsx';
import { Loader2, Users, Search, Filter, Star } from 'lucide-react';
import { ROLES } from '../../../constants/roles.js';

const ROLE_TABS = [
  { label: 'All', value: '' },
  { label: 'Builders & Developers', value: ROLES.BUILDER },
  { label: 'Architects', value: ROLES.ARCHITECT },
  { label: 'Contractors', value: ROLES.CONTRACTOR },
  { label: 'Labour', value: ROLES.LABOUR },
  { label: 'Suppliers', value: ROLES.SUPPLIER },
];

export default function ProfessionalDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentRole = searchParams.get('role') || '';
  const searchQuery = searchParams.get('q') || '';
  const currentRating = searchParams.get('rating') || '';

  // Specialized state for Builder Role
  const [activeBuilderTab, setActiveBuilderTab] = useState('builders'); // 'builders' | 'projects'

  const { professionals, fetchProfessionals, isLoading, error } = useDirectoryStore();
  const { toast } = useUIStore();

  useEffect(() => {
    // Only fetch professionals if not looking at projects
    if (currentRole === ROLES.BUILDER && activeBuilderTab === 'projects') {
        return;
    }

    const params = { role: currentRole, search: searchQuery };
    if (currentRating) params.rating = currentRating;

    fetchProfessionals(params).catch(err => {
      toast.error('Failed to load professionals');
    });
  }, [currentRole, searchQuery, currentRating, activeBuilderTab, fetchProfessionals, toast]);

  const handleRoleChange = (role) => {
    const newParams = new URLSearchParams(searchParams);
    if (role) newParams.set('role', role);
    else newParams.delete('role');
    
    // reset builder specific stuff safely
    newParams.delete('rating');
    setActiveBuilderTab('builders');
    
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('q', value);
    else newParams.delete('q');
    setSearchParams(newParams);
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Professional Directory</h1>
        <p className="text-gray-500 mt-1">Connect with trusted construction professionals across categories.</p>
      </div>

      {/* Main Role Tabs */}
      {currentRole !== ROLES.BUILDER && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-gray-200">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleRoleChange(tab.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shadow-sm border ${
                currentRole === tab.value
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Conditional UI based on Role Selection */}
      {currentRole === ROLES.BUILDER ? (
        // ********** BUILDER SPECIFIC UI **********
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {/* Specialized Sub-Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveBuilderTab('builders')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeBuilderTab === 'builders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Builders & Developers
                    </button>
                    <button 
                        onClick={() => setActiveBuilderTab('projects')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeBuilderTab === 'projects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Construction Projects
                    </button>
                </div>

                {/* Shared Search/Filters customized per sub-tab */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={activeBuilderTab === 'builders' ? "Search builders..." : "Search projects..."}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                    </div>
                    
                    {activeBuilderTab === 'builders' && (
                        <div className="relative">
                            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={currentRating}
                                onChange={handleRatingChange}
                                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm appearance-none"
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Render Builder Sub-tab Views */}
            {activeBuilderTab === 'projects' ? (
                <BuilderProjectList searchQuery={searchQuery} />
            ) : (
                <>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                    <p className="text-gray-500 mt-4">Finding builders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
                    {error}
                    </div>
                ) : professionals.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No builders found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {professionals.map((prof) => (
                        <ProfessionalCard key={prof._id} professional={prof} />
                    ))}
                    </div>
                )}
                </>
            )}
        </div>
      ) : (
        // ********** STANDARD UI FOR ALL OTHER ROLES **********
        <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center justify-end">
                <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or skill..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                <p className="text-gray-500 mt-4">Finding professionals...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
                {error}
                </div>
            ) : professionals.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No professionals found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {professionals.map((prof) => (
                    <ProfessionalCard key={prof._id} professional={prof} />
                ))}
                </div>
            )}
        </>
      )}
    </div>
  );
}
