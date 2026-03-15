import { Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase } from 'lucide-react';

export default function JobCard({ job }) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
        <Link
          to={`/jobs/${job._id}`}
          className="text-orange-600 hover:text-orange-700 text-sm font-bold transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

