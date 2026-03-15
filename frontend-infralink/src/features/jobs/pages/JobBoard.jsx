import { useEffect, useState } from 'react';
import useJobStore from '../../../store/job.store.js';
import JobCard from '../components/JobCard.jsx';
import JobFilters from '../components/JobFilters.jsx';
import { Loader2 } from 'lucide-react';

export default function JobBoard() {
  const { jobs, isLoading, error, fetchJobs, pagination } = useJobStore();
  const [filters, setFilters] = useState({ query: '', jobType: '', location: '' });
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [debouncedLocation, setDebouncedLocation] = useState(filters.location);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filters.query);
      setDebouncedLocation(filters.location);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.query, filters.location]);

  useEffect(() => {
    fetchJobs({
      page,
      limit: 10,
      search: debouncedQuery || undefined,
      jobType: filters.jobType || undefined,
      'location.city': debouncedLocation || undefined,
    });
  }, [page, debouncedQuery, filters.jobType, debouncedLocation, fetchJobs]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Find Construction Jobs</h1>
        <p className="text-gray-600">Browse thousands of projects, daily wage work, and contracts.</p>
      </div>

      <JobFilters filters={filters} setFilters={(f) => { setFilters(f); setPage(1); }} />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
          Failed to load jobs: {error}
        </div>
      )}

      {isLoading && jobs.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query to find more results.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination component */}
      {!isLoading && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 flex items-center">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
