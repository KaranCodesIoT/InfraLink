import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase, Building2, Calendar, FileText } from 'lucide-react';
import api from '../../../lib/axios.js';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { toast } = useUIStore();
  
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.data);
      } catch (err) {
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id, toast]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`);
      toast.success('Successfully applied to this job!');
      // Update local state to show applied
      setJob(prev => ({ ...prev, _hasApplied: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-20 text-gray-500">Job not found.</div>;
  }

  const isClient = user?._id === job.clientId?._id || user?._id === job.clientId;

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{job.clientId?.name || 'Verified Client'}</span>
              </div>
            </div>
            {!isClient && (
              <button
                onClick={handleApply}
                disabled={isApplying || job._hasApplied || job.status !== 'OPEN'}
                className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isApplying ? 'Applying...' : job._hasApplied ? 'Applied' : job.status !== 'OPEN' ? 'Closed' : 'Apply Now'}
              </button>
            )}
            {isClient && (
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold border border-blue-200">
                Your Listing
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Job Type</p>
              <p className="font-semibold text-gray-900">{job.jobType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</p>
              <p className="font-semibold text-gray-900">{job.location?.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><IndianRupee className="w-4 h-4"/> Budget</p>
              <p className="font-semibold text-gray-900">{job.budget ? `₹${job.budget}` : 'Negotiable'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Posted</p>
              <p className="font-semibold text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" /> Project Description
          </h3>
          <div className="prose max-w-none text-gray-600 whitespace-pre-line mb-8">
            {job.description}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Skills & Requirements</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {job.skillsRequired?.map((skill, index) => (
              <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
