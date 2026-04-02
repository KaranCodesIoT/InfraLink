import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useJobStore from '../../../store/job.store.js';
import useAuthStore from '../../../store/auth.store.js';
import JobCard from '../components/JobCard.jsx';
import JobFilters from '../components/JobFilters.jsx';
import { Loader2, PlusCircle, Briefcase, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export default function JobBoard() {
  const { jobs, isLoading, error, fetchJobs, pagination } = useJobStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', category: '', city: '', budgetMin: '', budgetMax: '' });
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');

  // Debounce search + city inputs
  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setDebouncedCity(filters.city);
    }, 400);
    return () => clearTimeout(h);
  }, [filters.search, filters.city]);

  const load = useCallback(() => {
    fetchJobs({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      city: debouncedCity || undefined,
      budgetMin: filters.budgetMin || undefined,
      budgetMax: filters.budgetMax || undefined,
    });
  }, [page, debouncedSearch, filters.category, debouncedCity, filters.budgetMin, filters.budgetMax, fetchJobs]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (f) => {
    setFilters(f);
    setPage(1);
  };

  const handlePage = (next) => {
    if (next >= 1 && pagination && next <= pagination.pages) {
      setPage(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
            <Briefcase className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-extrabold text-gray-900">Available Jobs</h1>
          </div>
          <p className="text-gray-500">Browse construction jobs and projects across India.</p>
        </div>
        <Link
          to={ROUTES.JOB_POST}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-orange-700 transition whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Post a Job
        </Link>
      </div>

      {/* Filters */}
      <JobFilters filters={filters} setFilters={handleFilterChange} />

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200">
          Failed to load jobs: {error}
        </div>
      )}

      {/* Job list */}
      {isLoading && jobs.length === 0 ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No jobs found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your filters or be the first to post a job!</p>
          <Link
            to={ROUTES.JOB_POST}
            className="inline-block mt-6 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition text-sm"
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination?.pages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePage(page + 1)}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
