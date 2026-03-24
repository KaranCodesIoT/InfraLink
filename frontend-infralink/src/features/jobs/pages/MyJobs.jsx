import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, PlusCircle, Briefcase, MapPin, Calendar, Users,
  Trash2, Edit, ChevronLeft, ChevronRight, Tag,
} from 'lucide-react';
import useJobStore from '../../../store/job.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROUTES } from '../../../constants/routes.js';

const STATUS_COLORS = {
  open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
  draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  on_hold: 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function MyJobs() {
  const { myJobs, myJobsPagination, isLoading, fetchMyJobs, deleteJob, isSubmitting } = useJobStore();
  const { toast } = useUIStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchMyJobs({ page, limit: 10 });
  }, [page, fetchMyJobs]);

  const handleDelete = async (id) => {
    try {
      await deleteJob(id);
      toast.success('Job deleted successfully');
      setConfirmDelete(null);
    } catch (e) {
      toast.error(e.response?.data?.error?.message || 'Failed to delete job');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-orange-600" />
            My Posted Jobs
          </h1>
          <p className="text-gray-500 mt-1">Manage all the jobs you've posted on InfraLink.</p>
        </div>
        <Link
          to={ROUTES.JOB_POST}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-orange-700 transition whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Post a New Job
        </Link>
      </div>

      {isLoading && myJobs.length === 0 ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : myJobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <Briefcase className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No jobs posted yet</h3>
          <p className="text-gray-400 mb-6 text-sm">Post your first job and start finding the right professionals.</p>
          <Link
            to={ROUTES.JOB_POST}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myJobs.map((job) => (
            <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                      {job.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    {job.category && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Tag className="w-3 h-3" /> {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
                      </span>
                    )}
                    {job.isUrgent && (
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Urgent</span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">
                    <Link to={`/jobs/${job._id}`} className="hover:text-orange-600 transition-colors">{job.title}</Link>
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {job.location?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location.city}
                      </span>
                    )}
                    {job.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due {new Date(job.deadline).toLocaleDateString('en-IN')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {job.applicationsCount || 0} Application{job.applicationsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-sm text-gray-500 hover:text-orange-600 font-medium px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    View
                  </Link>
                  {confirmDelete === job._id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Delete?</span>
                      <button
                        onClick={() => handleDelete(job._id)}
                        disabled={isSubmitting}
                        className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                      >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs font-medium text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(job._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && myJobsPagination?.pages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-[80px] text-center">
            Page {page} / {myJobsPagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(myJobsPagination.pages, p + 1))}
            disabled={page === myJobsPagination.pages}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
