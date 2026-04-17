import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase, User, Loader2, Zap, Calendar } from 'lucide-react';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROLE_LABELS, WORKER_ROLES } from '../../../constants/roles.js';
import ApplyModal from './ApplyModal.jsx';

const CATEGORY_COLORS = {
  builder: 'bg-blue-100 text-blue-700',
  contractor: 'bg-purple-100 text-purple-700',
  architect: 'bg-teal-100 text-teal-700',
  labour: 'bg-yellow-100 text-yellow-700',
  supplier: 'bg-green-100 text-green-700',
  general: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS = {
  open: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
  draft: 'bg-yellow-100 text-yellow-700',
  on_hold: 'bg-orange-100 text-orange-700',
};

const formatBudget = (budget) => {
  if (!budget) return 'Negotiable';
  if (budget.min && budget.max) return `₹${budget.min.toLocaleString()} – ₹${budget.max.toLocaleString()}`;
  if (budget.min) return `From ₹${budget.min.toLocaleString()}`;
  if (budget.max) return `Up to ₹${budget.max.toLocaleString()}`;
  return 'Negotiable';
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function JobCard({ job: initialJob }) {
  const [job, setJob] = useState(initialJob);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useUIStore();

  const isOwner = user && job.client?._id === user._id;

  // Determine if the user's role matches the target job category
  const isMatchingRole = () => {
    if (!user) return false;
    if (job.category === 'labour') return ['labour', 'worker'].includes(user.role);
    if (job.category === 'contractor') return user.role === 'contractor';
    if (job.category === 'architect') return user.role === 'architect';
    return WORKER_ROLES.includes(user.role);
  };
  
  // Only non-owners with matching roles can apply
  const canApply = user && !isOwner && job.status === 'open' && isMatchingRole();

  return (

    <>
      <div className={`bg-white border rounded-xl p-5 hover:shadow-md transition-all relative ${job.isUrgent ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'}`}>
        {/* Urgent badge */}
        {job.isUrgent && (
          <span className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> Urgent
          </span>
        )}

        {/* Title + description */}
        <div className="mb-4 pr-16">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[job.category] || 'bg-gray-100 text-gray-600'}`}>
              {job.category?.charAt(0).toUpperCase() + job.category?.slice(1)}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
              {job.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-2 mb-1 leading-snug">
            <Link to={`/jobs/${job._id}`} className="hover:text-orange-600 transition-colors">
              {job.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 min-w-0">
            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate text-xs">{job.client?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{ROLE_LABELS[job.client?.role] || 'Member'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate text-xs">{job.location?.city || 'Location TBD'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <IndianRupee className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs">{formatBudget(job.budget)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            {job.deadline ? (
              <>
                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs">Due {formatDate(job.deadline)}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs">{formatDate(job.createdAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Skills + Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 flex-wrap gap-3">
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills?.slice(0, 3).map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                {skill}
              </span>
            ))}
            {job.requiredSkills?.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{job.requiredSkills.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/jobs/${job._id}`}
              className="text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors"
            >
              View Details
            </Link>
            {isOwner && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                Your Post
              </span>
            )}
            {canApply && !job._hasApplied && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors flex items-center gap-1.5"
              >
                Apply Now
              </button>
            )}
            {canApply && job._hasApplied && (
              <span className="text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                ✓ Applied
              </span>
            )}
            {!canApply && !isOwner && job.status !== 'open' && (
              <span className="text-xs text-gray-400 font-medium">Closed</span>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={() => setJob((prev) => ({ ...prev, _hasApplied: true }))}
        />
      )}
    </>
  );
}
