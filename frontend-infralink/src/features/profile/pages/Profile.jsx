import { User, MapPin, Mail, Phone, Briefcase, Calendar, Edit2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store.js';
import { ROUTES } from '../../../constants/routes.js';
import { ROLE_LABELS } from '../../../constants/roles.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';
import { useEffect, useState } from 'react';
import api from '../../../lib/axios.js';
import BuilderProjectCard from '../../builderProjects/components/BuilderProjectCard.jsx';
import { Loader2, PlusCircle, Building2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const [myProjects, setMyProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (user && user.role === 'builder') {
      setLoadingProjects(true);
      api.get(`/builder-projects?builder=${user._id}&sort=-createdAt`)
        .then(({ data }) => setMyProjects(data.data || []))
        .catch(console.error)
        .finally(() => setLoadingProjects(false));
    }
  }, [user]);

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const isUnassigned = !user.role || user.role === 'unassigned';
  const locationStr = user.location?.city
    ? [user.location.city, user.location.state].filter(Boolean).join(', ')
    : null;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600" />
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center">
              {user.avatar ? (
                <img src={resolveAvatarUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-orange-600" />
                </div>
              )}
            </div>
            <Link
              to={ROUTES.PROFILE_EDIT}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </Link>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {isUnassigned ? (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
                  Role not set — <Link to={ROUTES.PROFILE_EDIT} className="text-orange-600 underline">Set your role</Link>
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                  {roleLabel}{user.contractorType ? ` - ${user.contractorType}` : ''}
                </span>
              )}
              {locationStr && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> {locationStr}
                </span>
              )}
              {user.experience && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Award className="w-3.5 h-3.5" /> {user.experience}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3">
              <Link to="/network" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                 {user.followersCount || 0} <span className="text-gray-500">Followers</span>
              </Link>
              <Link to="/network?tab=following" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                 {user.followingCount || 0} <span className="text-gray-500">Following</span>
              </Link>
              <div className="ml-4 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Privacy:</span>
                <button
                  onClick={async () => {
                    const { networkService } = await import('../../network/api/network.service.js');
                    if (window.confirm(`Switch to ${user.isPrivate ? 'Public' : 'Private'}? ${user.isPrivate ? '(All pending requests will be auto-accepted)' : ''}`)) {
                       await networkService.togglePrivacy(!user.isPrivate);
                       window.location.reload(); // Simple state sync strategy
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.isPrivate ? 'bg-gray-800 text-white' : 'bg-green-100 text-green-800'}`}
                >
                  {user.isPrivate ? 'Private' : 'Public'}
                </button>
              </div>
            </div>

            {user.bio && (
              <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid for Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-1 border-t-4 border-t-blue-500">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">Location</p>
                <p className="text-gray-900 font-medium">{locationStr || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2 border-t-4 border-t-orange-500">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-xs mb-1">Role</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                {isUnassigned ? <span className="text-gray-400 italic">Not set</span> : roleLabel}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Experience</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                {user.experience || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Joined</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Skills & Expertise</h3>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-lg border border-orange-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No skills added yet.{' '}
                <Link to={ROUTES.PROFILE_EDIT} className="text-orange-600 underline">Add skills</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* My Projects Section (For Builders) */}
      {user.role === 'builder' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              My Posted Projects
            </h2>
            <Link
              to={ROUTES.POST_BUILDER_PROJECT}
              className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-100 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Post New
            </Link>
          </div>
          
          {loadingProjects ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
            </div>
          ) : myProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProjects.map(proj => (
                <BuilderProjectCard key={proj._id} project={proj} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">You haven't posted any projects yet.</p>
              <Link
                to={ROUTES.POST_BUILDER_PROJECT}
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Post your first project
              </Link>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
