import { Link } from 'react-router-dom';
import { MapPin, User, ArrowRight, Star, Wrench } from 'lucide-react';

export default function ContractorCard({ contractor }) {
  const {
    _id,
    name,
    fullName,
    location,
    avatar,
    skills = [],
    yearsOfExperience,
    averageRating = 0,
    followersCount = 0,
    contractorType
  } = contractor;

  const displayName = fullName || name;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-orange-100 transition-all duration-300 group flex flex-col">
      <div className="p-5 flex-1">
        {/* Header: Avatar + Name */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-orange-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
              {displayName}
            </h3>
            <span className="inline-flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
              <Wrench className="w-3 h-3 mr-1" />
              {contractorType || 'Contractor'}
            </span>
          </div>
        </div>

        {/* Rating + Experience */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center text-sm font-bold text-gray-900 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 mr-1" />
            {Number(averageRating).toFixed(1)}
          </div>
          {yearsOfExperience !== undefined && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              {yearsOfExperience} Yrs Exp
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {followersCount} followers
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          {location?.city ? `${location.city}, ${location.state || ''}` : 'Location not specified'}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-md border border-orange-100 font-medium">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-gray-400 text-xs py-0.5">+{skills.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-gray-50 p-4">
        <Link
          to={`/directory/contractor/${_id}`}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-orange-600 hover:text-white hover:bg-orange-600 py-2.5 rounded-xl transition-all duration-200 border border-orange-100 hover:border-orange-600"
        >
          <span>View Detailed Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
