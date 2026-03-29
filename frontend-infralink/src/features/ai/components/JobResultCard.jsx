import React from 'react';
import { MapPin, IndianRupee, Briefcase, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JobResultCard({ job }) {
  const navigate = useNavigate();
  if (!job) return null;

  const budgetText = job.budget
    ? `₹${job.budget.min?.toLocaleString() || '0'} - ₹${job.budget.max?.toLocaleString() || '0'}`
    : 'Budget not specified';

  const location = job.location
    ? [job.location.city, job.location.state].filter(Boolean).join(', ')
    : null;

  const timeAgo = job.createdAt ? getTimeAgo(job.createdAt) : '';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all w-72 flex-shrink-0 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate" title={job.title}>
            {job.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Briefcase size={11} />
            Posted by {job.client || 'Unknown'}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
          job.status === 'open' 
            ? 'bg-green-50 text-green-700 border border-green-100' 
            : 'bg-gray-50 text-gray-600 border border-gray-100'
        }`}>
          {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <IndianRupee size={13} className="text-green-500" />
          <span className="font-medium">{budgetText}</span>
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin size={13} className="text-orange-400" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {timeAgo && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={12} />
            <span>{timeAgo}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {job.requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {job.requiredSkills.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-medium">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">
              +{job.requiredSkills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action */}
      <button
        onClick={() => navigate(`/jobs/${job.id}`)}
        className="w-full mt-4 flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-700 text-xs font-semibold py-2.5 rounded-lg border border-orange-200 transition-all group-hover:shadow-sm"
      >
        View Details <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
