import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Briefcase, Calendar, Award, ShieldAlert, Lock, MessageCircle } from 'lucide-react';
import { userService } from '../services/user.service.js';
import { ROLES, ROLE_LABELS } from '../../../constants/roles.js';
import FollowButton from '../../network/components/FollowButton.jsx';
import BlockButton from '../../network/components/BlockButton.jsx';
import useNetworkStore from '../../../store/network.store.js';
import BuilderProjectCard from '../../builderProjects/components/BuilderProjectCard.jsx';
import api from '../../../lib/axios.js';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followStatus, setFollowStatus] = useState('loading'); // needed to decide if we show private info
  const [isBlockedGlobal, setIsBlockedGlobal] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [isFollowingBack, setIsFollowingBack] = useState(false);

  // For builder projects
  const [builderProjects, setBuilderProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getUserProfile(id);
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 404 && (err.response?.data?.message.includes('unavailable') || err.response?.data?.message.includes('found'))) {
          setError('User not found or account unavailable'); // Blocked!
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    // If it's a builder and they're not restricted, load their projects
    if (profile?.role === 'builder' && (!profile.isPrivate || followStatus === 'accepted' || followStatus === 'following')) {
      const fetchProjects = async () => {
        try {
          setLoadingProjects(true);
          const { data } = await api.get(`/builder-projects?builder=${id}`);
          setBuilderProjects(data.data || []);
        } catch (err) {
          console.error('Failed to fetch builder projects:', err);
        } finally {
          setLoadingProjects(false);
        }
      };
      fetchProjects();
    }
  }, [profile, id, followStatus]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading profile...</div>;
  
  if (isBlockedGlobal) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg max-w-2xl mx-auto mt-10 shadow-sm border border-red-100 font-medium py-12"><ShieldAlert className="w-12 h-12 mx-auto mb-4 text-red-400" />User not found or account unavailable</div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg max-w-2xl mx-auto mt-10 shadow-sm border border-red-100 font-medium py-12"><ShieldAlert className="w-12 h-12 mx-auto mb-4 text-red-400" />{error}</div>;
  
  if (!profile) return null;

  const roleLabel = ROLE_LABELS[profile.role] || profile.role;
  const locationStr = profile.location?.city
    ? [profile.location.city, profile.location.state].filter(Boolean).join(', ')
    : null;

  const isRestricted = profile.isPrivate && followStatus !== 'accepted' && followStatus !== 'following';

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600" />
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {profile.role !== ROLES.NORMAL_USER && profile.role !== ROLES.CLIENT && (
                <FollowButton targetId={id} onStatusChange={(s, data) => {
                  setFollowStatus(s);
                  if (data) {
                    // Message enabled if ANY follow exists in either direction
                    const hasFollow = (s === 'accepted' || s === 'following' || data.is_following_back);
                    setCanMessage(hasFollow);
                    setIsFollowingBack(data.is_following_back || false);
                  }
                }} />
              )}
              {canMessage ? (
                <Link
                  to={`/messages?user=${id}`}
                  className="border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
              ) : (
                <button
                  disabled
                  className="border border-gray-200 bg-gray-50 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed"
                  title="Follow this user to send messages"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
              )}
              <BlockButton targetId={id} onBlockChange={(blocked) => setIsBlockedGlobal(blocked)} />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {profile.name}
              {profile.isPrivate && <Lock className="w-4 h-4 text-gray-400" title="Private Account" />}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                {roleLabel}{profile.contractorType ? ` - ${profile.contractorType}` : ''}
              </span>
              <span className="text-sm font-medium text-gray-700">
                 {profile.followersCount || 0} Followers &middot; {profile.followingCount || 0} Following
              </span>
              {isFollowingBack && (
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                  Follows You
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {isRestricted ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          <Lock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">This Account is Private</h3>
          <p className="text-sm">Follow this account to see their photos, details, and posts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-1 border-t-4 border-t-blue-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="text-gray-900 font-medium">{profile.phone || 'Not provided'}</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2 border-t-4 border-t-blue-500">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-xs mb-1">Role</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {roleLabel}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Experience</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  {profile.experience || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Joined</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Skills & Expertise</h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No skills listed</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Builder Projects Section */}
      {!isRestricted && profile.role === 'builder' && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            Projects by {profile.name}
          </h2>
          
          {loadingProjects ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : builderProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builderProjects.map((proj) => (
                <BuilderProjectCard key={proj._id} project={proj} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500">
              No projects posted yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
