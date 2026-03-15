import { User, MapPin, Mail, Phone, Briefcase, Calendar, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store.js';
import { ROUTES } from '../../../constants/routes.js';

export default function Profile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-600" />
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
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
            <p className="text-gray-500 font-medium mt-1">
              Role: <span className="text-gray-900 capitalize">{user.role.replace('_', ' ')}</span>
            </p>
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
              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Phone className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Location</p>
                <p className="text-gray-900 font-medium">
                  {user.location?.city ? `${user.location.city}, ${user.location.state || ''}` : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2 border-t-4 border-t-orange-500">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-xs mb-1">Company / Organization</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                {user.companyName || 'N/A'}
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
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No skills added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
