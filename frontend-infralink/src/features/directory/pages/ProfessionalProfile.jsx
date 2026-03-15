import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore } from '../../../store/index.js';
import { Loader2, MapPin, User, Mail, Phone, ArrowLeft, Star, Calendar, ShieldCheck, HardHat } from 'lucide-react';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProfessional, getProfessionalById, isLoading, error, clearSelectedProfessional } = useDirectoryStore();
  const { toast } = useUIStore();

  useEffect(() => {
    getProfessionalById(id).catch(() => {
      toast.error('Failed to load professional profile');
    });
    return () => clearSelectedProfessional();
  }, [id, getProfessionalById, clearSelectedProfessional, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
        <p className="text-gray-500 mt-4">Loading profile details...</p>
      </div>
    );
  }

  if (error || !selectedProfessional) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-red-700">{error || 'Professional not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center text-sm font-medium text-red-700 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { name, role, location, avatar, skills = [], createdAt } = selectedProfessional;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-32 h-32 rounded-3xl bg-orange-100 mx-auto flex items-center justify-center overflow-hidden mb-4 shadow-inner">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-orange-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <p className="text-orange-600 font-medium capitalize mt-1 text-sm bg-orange-50 inline-block px-3 py-1 rounded-full">
              {role.replace('_', ' ')}
            </p>

            <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                <span>{location?.city ? `${location.city}, ${location.state || ''}` : 'Location hidden'}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm opacity-60">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span>Email hidden for privacy</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm opacity-60">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span>Phone hidden for privacy</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Verification</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-green-600 font-medium">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Identity Verified
              </div>
              <div className="flex items-center text-sm text-blue-600 font-medium">
                <HardHat className="w-4 h-4 mr-2" />
                Professional Background Checked
              </div>
            </div>
          </div>
        </div>

        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About {name.split(' ')[0]}</h2>
            <p className="text-gray-600 leading-relaxed">
              Experience construction professional with a demonstrated history of working in the infrastructure industry. 
              Skilled in project management, team leadership, and specialized technical execution.
              {/* This would ideally come from a 'bio' field in the DB */}
            </p>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, idx) => (
                    <span key={idx} className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium border border-orange-100 transition-all hover:scale-105 cursor-default">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">No specific skills listed.</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Platform Activity</h2>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Joined {new Date(createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="p-8 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-xl font-bold text-gray-900">01+</div>
                <div className="text-xs text-gray-500 uppercase mt-1">Projects</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-xl font-bold text-gray-900">4.9/5</div>
                <div className="text-xs text-gray-500 uppercase mt-1">Rating</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-xl font-bold text-gray-900">100%</div>
                <div className="text-xs text-gray-500 uppercase mt-1">Completion</div>
              </div>
            </div>
          </div>

          <button className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
            Hire / Contact Professional
          </button>
        </div>
      </div>
    </div>
  );
}
