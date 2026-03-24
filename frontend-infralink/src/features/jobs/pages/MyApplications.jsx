import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, FileText, Briefcase, MapPin, Calendar, ChevronLeft, ChevronRight, Tag,
} from 'lucide-react';
import useJobStore from '../../../store/job.store.js';
import { ROUTES } from '../../../constants/routes.js';

const STATUS_STYLES = {
  pending:    { bg: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Review' },
  shortlisted:{ bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Shortlisted' },
  hired:      { bg: 'bg-green-100 text-green-800 border-green-200', label: 'Hired!' },
  rejected:   { bg: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
  withdrawn:  { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Withdrawn' },
};

export default function MyApplications() {
  const { myApplications, myApplicationsPagination, isLoading, fetchMyApplications } = useJobStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMyApplications({ page, limit: 10 });
  }, [page, fetchMyApplications]);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-orange-600" />
          My Applications
        </h1>
        <p className="text-gray-500 mt-1">Track the status of all jobs you've applied for.</p>
      </div>

      {isLoading && myApplications.length === 0 ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : myApplications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-400 mb-6 text-sm">Browse available jobs and apply to ones that match your skills.</p>
          <Link
            to={ROUTES.JOBS}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition text-sm"
          >
            <Briefcase className="w-4 h-4" /> Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myApplications.map((app) => {
            const job = app.job;
            const statusInfo = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
            return (
              <div key={app._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {job?.category && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                          <Tag className="w-3 h-3" /> {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {job ? (
                        <Link to={`/jobs/${job._id}`} className="hover:text-orange-600 transition-colors">{job.title}</Link>
                      ) : (
                        <span className="text-gray-400 italic">Job no longer available</span>
                      )}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      {job?.client?.name && (
                        <span>By <strong className="text-gray-700">{job.client.name}</strong></span>
                      )}
                      {job?.location?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {job.location.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {app.proposedRate && (
                      <p className="text-sm text-gray-600 mt-1">Your bid: <strong>₹{app.proposedRate.toLocaleString()}</strong></p>
                    )}
                    {app.message && (
                      <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 line-clamp-2">
                        "{app.message}"
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusInfo.bg}`}>
                      {statusInfo.label}
                    </span>
                    {/* Status description */}
                    <p className="text-xs text-gray-400 text-right max-w-[160px]">
                      {app.status === 'hired' && '🎉 Congratulations!'}
                      {app.status === 'shortlisted' && 'You\'re on the shortlist'}
                      {app.status === 'pending' && 'Awaiting review'}
                      {app.status === 'rejected' && 'Not selected this time'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && myApplicationsPagination?.pages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-[80px] text-center">
            Page {page} / {myApplicationsPagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(myApplicationsPagination.pages, p + 1))}
            disabled={page === myApplicationsPagination.pages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
