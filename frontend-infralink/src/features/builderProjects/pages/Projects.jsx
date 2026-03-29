import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios.js';
import useAuthStore from '../../../store/auth.store.js';
import BuilderProjectCard from '../components/BuilderProjectCard.jsx';
import { Loader2, Building2, ArrowLeft, Filter, MapPin, PlusCircle, HardHat, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export default function Projects() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [propertyType, setPropertyType] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 400);
    return () => clearTimeout(timer);
  }, [user, propertyType, sort, locationQuery]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      let query = `/builder-projects?builder=${user._id}&sort=${sort}`;
      if (propertyType) query += `&propertyType=${propertyType}`;
      if (locationQuery) query += `&city=${encodeURIComponent(locationQuery)}`;

      const { data } = await api.get(query);
      setProjects(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const ongoingProjects = projects.filter(p => !['Ready to Move', 'Completed'].includes(p.projectStatus));
  const completedProjects = projects.filter(p => ['Ready to Move', 'Completed'].includes(p.projectStatus));

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 mb-6 transition-all w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-extrabold text-gray-900">My Projects</h1>
          </div>
          <p className="text-gray-500">Manage and view all your posted projects.</p>
        </div>
        <Link
          to={ROUTES.POST_BUILDER_PROJECT}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-orange-700 transition whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-auto flex-1">
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Content */}
      {loading && projects.length === 0 ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No projects yet</h3>
          <p className="text-gray-400 text-sm">You haven't posted any projects. Start by posting your first project!</p>
          <Link
            to={ROUTES.POST_BUILDER_PROJECT}
            className="inline-flex items-center gap-2 mt-6 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Project
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Ongoing Projects */}
          {ongoingProjects.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <HardHat className="w-4 h-4 text-amber-500" />
                Ongoing Projects ({ongoingProjects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ongoingProjects.map((proj) => (
                  <BuilderProjectCard key={proj._id} project={proj} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed Projects ({completedProjects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
