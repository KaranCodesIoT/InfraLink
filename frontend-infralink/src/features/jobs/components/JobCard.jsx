import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase, User, Loader2 } from 'lucide-react';
import api from '../../../lib/axios.js';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROLES, ROLE_LABELS } from '../../../constants/roles.js';

export default function JobCard({ job: initialJob }) {
  const [job, setJob] = useState(initialJob);
  const [isApplying, setIsApplying] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useUIStore();

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOwner = user?._id === job.client?._id;
  const canApply = user && [ROLES.CONTRACTOR, ROLES.ARCHITECT, ROLES.LABOUR, ROLES.SUPPLIER, ROLES.WORKER, ROLES.BUILDER].includes(user.role) && !isOwner;

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await api.post('/applications', { job: job._id });
      toast.success('Successfully applied to this job!');
      setJob(prev => ({ ...prev, _hasApplied: true }));
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes('duplicate')) {
         toast.error('You have already applied to this job.');
         setJob(prev => ({ ...prev, _hasApplied: true }));
      } else {
         toast.error(err.response?.data?.message || 'Failed to apply');
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            <Link to={`/jobs/${job._id}`} className="hover:text-orange-600 transition-colors">
              {job.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">{job.description}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 truncate">{job.client?.name || 'Unknown'}</span>
            <span className="text-xs text-gray-500">{ROLE_LABELS[job.client?.role] || 'User'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{job.jobType.replace('_', ' ')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{job.location?.city || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <IndianRupee className="w-4 h-4 text-gray-400" />
          <span>{job.budget ? `₹${job.budget}` : 'Negotiable'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{formatDate(job.createdAt)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {job.skillsRequired?.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              {skill}
            </span>
          ))}
          {job.skillsRequired?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{job.skillsRequired.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/jobs/${job._id}`}
            className="text-gray-600 hover:text-gray-900 text-sm font-bold transition-colors"
          >
            View Details
          </Link>
          {canApply && (
            <button
              onClick={handleApply}
              disabled={isApplying || job._hasApplied || job.status !== 'OPEN'}
              className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isApplying && <Loader2 className="w-4 h-4 animate-spin" />}
              {isApplying ? 'Applying...' : job._hasApplied ? 'Applied' : job.status !== 'OPEN' ? 'Closed' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

