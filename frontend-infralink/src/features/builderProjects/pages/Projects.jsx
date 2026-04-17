import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios.js';
import useAuthStore from '../../../store/auth.store.js';
import BuilderProjectCard from '../components/BuilderProjectCard.jsx';
import { Loader2, Building2, ArrowLeft, Filter, MapPin, PlusCircle, HardHat, CheckCircle2, Search, DollarSign, ArrowUpDown } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export default function Projects() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sort, setSort] = useState('-createdAt');

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      // Fetch all projects for this builder once
      const { data } = await api.get(`/builder-projects?builder=${user._id}`);
      setAllProjects(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      // 1. Search by Project Name (Case-insensitive, partial match)
      const matchName = !searchQuery || p.projectName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Search by Location (Case-insensitive, partial match on city or area)
      const matchLocation = !locationQuery || 
        p.city?.toLowerCase().includes(locationQuery.toLowerCase()) || 
        p.area?.toLowerCase().includes(locationQuery.toLowerCase());
      
      // 3. Filter by Project Type
      const matchType = !propertyType || p.propertyType === propertyType;
      
      // 4. Filter by Pricing Range
      let matchPrice = true;
      if (priceRange) {
        if (priceRange === 'under50l') matchPrice = p.price < 5000000;
        else if (priceRange === '50l-1cr') matchPrice = p.price >= 5000000 && p.price <= 10000000;
        else if (priceRange === '1cr-5cr') matchPrice = p.price > 10000000 && p.price <= 50000000;
        else if (priceRange === 'above5cr') matchPrice = p.price > 50000000;
      }

      return matchName && matchLocation && matchType && matchPrice;
    }).sort((a, b) => {
      if (sort === '-createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'price') return a.price - b.price;
      if (sort === '-price') return b.price - a.price;
      return 0;
    });
  }, [allProjects, searchQuery, locationQuery, propertyType, priceRange, sort]);

  const ongoingProjects = filteredProjects.filter(p => !['Ready to Move', 'Completed'].includes(p.projectStatus));
  const completedProjects = filteredProjects.filter(p => ['Ready to Move', 'Completed'].includes(p.projectStatus));

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
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
            <h1 className="text-3xl font-extrabold text-gray-900">Available Projects</h1>
          </div>
          <p className="text-gray-500">Explore real-time available projects and developments.</p>
        </div>
        <Link
          to={ROUTES.POST_BUILDER_PROJECT}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-orange-700 transition whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Project
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Project Name Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Location Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by location..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Dropdown */}
          <div className="relative">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="Flat">Flats / Apartments</option>
              <option value="Villa">Villas</option>
              {/* <option value="plot">Plots</option> */}
              <option value="Commercial">Commercial</option>
            </select>
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Price Range Dropdown */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
            >
              <option value="">All Prices</option>
              <option value="under50l">Under ₹50L</option>
              <option value="50l-1cr">₹50L - ₹1Cr</option>
              <option value="1cr-5cr">₹1Cr - ₹5Cr</option>
              <option value="above5cr">Above ₹5Cr</option>
            </select>
            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
            >
              <option value="-createdAt">Latest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Content */}
      {loading && allProjects.length === 0 ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : allProjects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No projects found</h3>
          <p className="text-gray-400 text-sm">There are no available projects right now. Please check back later!</p>
          {user?.role === 'builder' && (
            <Link
              to={ROUTES.POST_BUILDER_PROJECT}
              className="inline-flex items-center gap-2 mt-6 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Project
            </Link>
          )}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No matching projects</h3>
          <p className="text-gray-400 text-sm">We couldn't find any projects matching your current filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setLocationQuery('');
              setPropertyType('');
              setPriceRange('');
              setSort('-createdAt');
            }}
            className="mt-6 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            Clear all filters
          </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

