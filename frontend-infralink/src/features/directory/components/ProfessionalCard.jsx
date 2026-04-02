import { Link } from 'react-router-dom';
import { MapPin, User, ArrowRight, Briefcase, Star } from 'lucide-react';
import { ROUTES } from '../../../constants/routes.js';

export default function ProfessionalCard({ professional }) {
  const { _id, name, role, location, avatar, skills = [], companyName, yearsOfExperience } = professional;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-orange-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {companyName || name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-0.5 capitalize">
                <Briefcase className="w-3.5 h-3.5 mr-1" />
                {role.replace('_', ' ')}
                {yearsOfExperience !== undefined && <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs">{yearsOfExperience} Yrs Exp</span>}
              </div>
              
              <div className="flex items-center gap-3 mt-2 mb-2">
                <div className="flex items-center text-sm font-bold text-gray-900 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 mr-1" />
                  {Number(professional.averageRating || 0).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {professional.followersCount || 0} {role === 'supplier' ? 'clients' : 'followers'}
                </div>
              </div>
              
              {/* Dynamic Badges */}
              {role === 'supplier' && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {professional.isVerified && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm border border-blue-100 flex items-center">
                            Verified
                        </span>
                    )}
                    {professional.averageRating >= 4.5 && (
                        <span className="bg-orange-50 text-orange-600 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm border border-orange-100">
                            Top Rated
                        </span>
                    )}
                    {(professional.logistics?.sameDayDelivery || professional.aiMetrics?.deliverySuccessRate > 90) && (
                        <span className="bg-green-50 text-green-600 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm border border-green-100">
                            Fast Delivery
                        </span>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            {location?.city ? `${location.city}, ${location.state || ''}` : 'Location not specified'}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-100">
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="text-gray-400 text-xs py-1">+{skills.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-50 p-4">
        <Link
          to={
            role === 'contractor' ? `/directory/contractor/${_id}` : 
            role === 'builder' ? `/directory/builder/${_id}` : 
            role === 'supplier' ? `/directory/supplier/${_id}` : 
            `${ROUTES.DIRECTORY}/${_id}`
          }
          className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
        >
          <span>View Detailed Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
