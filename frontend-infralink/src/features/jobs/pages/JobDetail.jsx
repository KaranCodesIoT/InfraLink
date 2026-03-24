import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, IndianRupee, Briefcase, Calendar, FileText, User, Phone, Mail, Tag, Zap,
  ArrowLeft, Loader2, Users, Trash2,
} from 'lucide-react';
import api from '../../../lib/axios.js';
import useAuthStore from '../../../store/auth.store.js';
import useUIStore from '../../../store/ui.store.js';
import { ROLE_LABELS, WORKER_ROLES } from '../../../constants/roles.js'; // Added WORKER_ROLES
import ApplyModal from '../components/ApplyModal.jsx';

const CATEGORY_COLORS = {
  builder: 'bg-blue-100 text-blue-700',
  contractor: 'bg-purple-100 text-purple-700',
  architect: 'bg-teal-100 text-teal-700',
  labour: 'bg-yellow-100 text-yellow-700',
  supplier: 'bg-green-100 text-green-700',
  general: 'bg-gray-100 text-gray-700',
};

const STATUS_BADGE = {
  open: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
};

const APP_STATUS = {
  pending: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-600',
};

const formatBudget = (budget) => {
  if (!budget) return 'Negotiable';
  if (budget.min && budget.max) return `₹${budget.min.toLocaleString()} – ₹${budget.max.toLocaleString()}`;
  if (budget.min) return `From ₹${budget.min.toLocaleString()}`;
  if (budget.max) return `Up to ₹${budget.max.toLocaleString()}`;
  return 'Negotiable';
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useUIStore();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.data);
      } catch {
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, toast]);

  const isOwner = user?._id === job?.client?._id;

  useEffect(() => {
    if (job && isOwner) {
      setIsLoadingApps(true);
      api.get(`/applications/job/${id}`)
        .then(({ data }) => setApplications(data.data || []))
        .catch((err) => console.error('Failed to fetch applications', err))
        .finally(() => setIsLoadingApps(false));
    }
  }, [job, isOwner, id]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      await api.patch(`/applications/${appId}`, { status });
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
      toast.success(`Application marked as ${status}`);
    } catch {
      toast.error('Failed to update application status');
    }
  };

  const handleDeleteJob = async () => {
    if (window.confirm("Are you sure you want to delete this job post? This action cannot be undone.")) {
      try {
        await api.delete(`/jobs/${job._id}`);
        toast.success("Job deleted successfully");
        navigate('/my-jobs');
      } catch (err) {
        toast.error(err.response?.data?.error?.message || "Failed to delete job");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-24 text-gray-400">Job not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 mb-6 transition-all w-fit">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Top section */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[job.category] || 'bg-gray-100 text-gray-600'}`}>
              {job.category?.charAt(0).toUpperCase() + job.category?.slice(1) || 'General'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[job.status] || 'bg-gray-100 text-gray-600'}`}>
              {job.status?.replace('_', ' ').toUpperCase()}
            </span>
            {job.isUrgent && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                <Zap className="w-3 h-3" /> Urgent
              </span>
            )}
          </div>

          {/* Title + action */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <User className="w-4 h-4" />
                <span>Posted by <strong>{job.client?.name || 'Unknown'}</strong></span>
                <span className="text-gray-400">({ROLE_LABELS[job.client?.role] || 'Member'})</span>
              </div>
            </div>
            <div className="shrink-0">
              {!isOwner && job.status === 'open' && !hasApplied && WORKER_ROLES.includes(user?.role) && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors text-sm"
                >
                  Apply Now
                </button>
              )}
              {!isOwner && hasApplied && (
                <span className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-bold text-sm">
                  ✓ Applied
                </span>
              )}
              {isOwner && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl">
                    Your Job Post
                  </span>
                  <button
                    onClick={handleDeleteJob}
                    className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meta cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 bg-gray-50 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Category</p>
            <p className="font-semibold text-gray-900 text-sm capitalize">{job.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</p>
            <p className="font-semibold text-gray-900 text-sm">{job.location?.city}, {job.location?.state}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Budget</p>
            <p className="font-semibold text-gray-900 text-sm">{formatBudget(job.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline</p>
            <p className="font-semibold text-gray-900 text-sm">
              {job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open-ended'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" /> Project Description
            </h3>
            <div className="prose max-w-none text-gray-600 text-sm whitespace-pre-line leading-relaxed">
              {job.description}
            </div>
          </div>

          {/* Skills */}
          {job.requiredSkills?.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm font-medium rounded-lg border border-orange-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details */}
          {(job.contactDetails?.name || job.contactDetails?.phone || job.contactDetails?.email) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-blue-500" /> Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                {job.contactDetails.name && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{job.contactDetails.name}</span>
                  </div>
                )}
                {job.contactDetails.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <a href={`tel:${job.contactDetails.phone}`} className="hover:text-blue-600 transition-colors">
                      {job.contactDetails.phone}
                    </a>
                  </div>
                )}
                {job.contactDetails.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <a href={`mailto:${job.contactDetails.email}`} className="hover:text-blue-600 transition-colors">
                      {job.contactDetails.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applications (for job owner) */}
          {isOwner && (
            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Applications ({job.applicationsCount || applications.length})
              </h3>
              {isLoadingApps ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No applications yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Share your job to attract candidates.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app._id} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        {/* Worker info */}
                        <div className="flex items-start gap-3">
                          {app.worker?.avatar ? (
                            <img src={app.worker.avatar} alt={app.worker.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                              {app.worker?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900">{app.worker?.name || 'Unknown'}</h4>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{ROLE_LABELS[app.worker?.role] || app.worker?.role}</p>
                            {app.proposedRate && (
                              <p className="text-sm text-gray-600 mt-1">Bid: ₹{app.proposedRate.toLocaleString()}</p>
                            )}
                            {(app.contactDetails?.phone || app.worker?.phone) && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {app.contactDetails?.phone || app.worker?.phone}
                              </p>
                            )}
                            {(app.contactDetails?.email || app.worker?.email) && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {app.contactDetails?.email || app.worker?.email}
                              </p>
                            )}
                            {app.message && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 line-clamp-3">
                                {app.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status + actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${APP_STATUS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                            {app.status?.toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-400">Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}</p>
                          {app.status === 'pending' && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                                className="text-xs font-bold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {app.status === 'shortlisted' && (
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'hired')}
                              className="text-xs font-bold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Mark Hired
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowModal(false)}
          onSuccess={() => setHasApplied(true)}
        />
      )}
    </div>
  );
}
