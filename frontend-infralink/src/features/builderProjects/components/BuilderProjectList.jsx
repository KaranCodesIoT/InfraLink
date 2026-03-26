import { useEffect, useState } from 'react';
import api from '../../../lib/axios.js';
import BuilderProjectCard from './BuilderProjectCard.jsx';
import { Loader2, Sparkles, Building2, Filter, HardHat, CheckCircle2, MapPin } from 'lucide-react';

export default function BuilderProjectList({ builderId, onProjectsLoaded }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [propertyType, setPropertyType] = useState('');
  const [sort, setSort] = useState('-createdAt'); // Latest first
  const [locationQuery, setLocationQuery] = useState(''); // Location filter

  useEffect(() => {
    // Basic debounce for location search
    const timer = setTimeout(() => {
      fetchProjects();
    }, 400);
    return () => clearTimeout(timer);
  }, [builderId, propertyType, sort, locationQuery]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      // Construct query string
      let query = `/builder-projects?builder=${builderId}&sort=${sort}`;
      if (propertyType) query += `&propertyType=${propertyType}`;
      if (locationQuery) query += `&city=${encodeURIComponent(locationQuery)}`;

      const { data } = await api.get(query);
      const fetchedProjects = data.data || [];
      setProjects(fetchedProjects);
      
      if (onProjectsLoaded) {
        onProjectsLoaded(fetchedProjects);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading builder projects...</p>
      </div>
    );
  }

  // Split projects based on status requirements
  const ongoingProjects = projects.filter(p => !['Ready to Move', 'Completed'].includes(p.projectStatus));
  const completedProjects = projects.filter(p => ['Ready to Move', 'Completed'].includes(p.projectStatus));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Projects by Builder
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Discover all {projects.length > 0 ? projects.length : ''} properties listed
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Location Search Input */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by location..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartments</option>
              <option value="villa">Villas</option>
              <option value="plot">Plots</option>
              <option value="commercial">Commercial</option>
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
          >
            <option value="-createdAt">Latest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium">
          {error}
        </div>
      ) : projects.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No projects found</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            This builder hasn't listed any properties matching these filters yet.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Ongoing Projects Grid */}
          {ongoingProjects.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <HardHat className="w-4 h-4 text-amber-500" />
                Ongoing Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {ongoingProjects.map((proj) => (
                  <BuilderProjectCard key={proj._id} project={proj} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Projects Grid */}
          {completedProjects.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {completedProjects.map((proj) => (
                  <BuilderProjectCard key={proj._id} project={proj} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
