import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import useBuilderProjectStore from '../../../store/builderProject.store.js';
import {
  Loader2, MapPin, User, Mail, ArrowLeft, Star, Briefcase,
  ShieldCheck, Pencil, Clock, Users, CheckCircle2,
  MessageCircle, Building2, FolderOpen, Image as ImageIcon,
  Activity
} from 'lucide-react';
import FollowButton from '../../network/components/FollowButton.jsx';
import BlockButton from '../../network/components/BlockButton.jsx';

export default function BuilderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedProfessional,
    getProfessionalById,
    clearSelectedProfessional,
    rateBuilder,
  } = useDirectoryStore();

  const isLoading = useDirectoryStore(state => state.isLoading);
  const error = useDirectoryStore(state => state.error);
  const { user: currentUser } = useAuthStore();
  const { toast } = useUIStore();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [canMessage, setCanMessage] = useState(false);
  const prevFollowStatusRef = useRef(null);
  
  const { projects: realTimeProjects, fetchProjects } = useBuilderProjectStore();

  useEffect(() => {
    getProfessionalById(id).catch(() => {
      toast.error('Failed to load builder profile');
    });
    
    // Fetch real-time available projects for this builder
    fetchProjects({ builder: id, sort: '-createdAt' });

    return () => clearSelectedProfessional();
  }, [id, getProfessionalById, clearSelectedProfessional, fetchProjects, toast]);

  const isOwner = !!(currentUser?._id && selectedProfessional?._id &&
    currentUser._id.toString() === selectedProfessional._id.toString());

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Please log in to leave a review');
    const builderProfileId = selectedProfessional?.builderProfile?._id || selectedProfessional?._id;
    if (rating === 0) return toast.error('Please select a star rating');

    setRatingLoading(true);
    try {
      await rateBuilder(builderProfileId, rating, reviewText);
      toast.success('Review submitted successfully!');
      setRating(0);
      setReviewText('');
    } catch (err) {}
    finally { setRatingLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
        <p className="text-gray-500 mt-4">Loading builder details...</p>
      </div>
    );
  }

  if (error || !selectedProfessional) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-red-700">{error || 'Builder not found'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center text-sm font-medium text-red-700 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const { name, avatar, builderProfile } = selectedProfessional;
  const displayName = builderProfile?.companyName || name;
  const profileType = builderProfile?.profileType || 'Builder';
  const serviceAreas = builderProfile?.serviceAreas || [];
  const yearsOfExperience = builderProfile?.yearsOfExperience || 0;
  const officeAddress = builderProfile?.officeAddress || '';
  const profDetails = builderProfile?.professionalDetails || {};
  const pastProjects = profDetails.pastProjects || [];
  const servicesOffered = profDetails.servicesOffered || [];
  const pricingModel = profDetails.pricingModel || 'fixed';
  const teamSize = profDetails.teamSize || 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Builders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-3xl bg-orange-100 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-16 h-16 text-orange-600" />
                )}
              </div>

              <div className="text-center w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                  {isOwner && (
                    <button onClick={() => navigate('/builder-onboarding')} className="text-orange-600 hover:text-orange-800 flex items-center text-xs font-medium transition-colors">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </button>
                  )}
                </div>
                <p className="text-orange-600 font-semibold capitalize text-xs bg-orange-50 inline-block px-3 py-1 rounded-full mb-4">
                  {profileType}
                </p>

                <div className="flex items-center justify-center gap-4 py-4 border-y border-gray-50 mb-6 flex-wrap">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {Number(selectedProfessional.averageRating || 0).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedProfessional.totalReviews || 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-500 mr-1" />
                      {selectedProfessional.followersCount || 0}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Followers</p>
                  </div>
                </div>

                {/* Follow / Block / Message Actions */}
                {!isOwner && selectedProfessional?._id && (
                  <div className="w-full space-y-2 pt-2">
                    <div className="flex gap-2 justify-center">
                      <FollowButton
                        targetId={selectedProfessional._id}
                        onStatusChange={(s, data) => {
                          if (data) {
                            const hasFollow = (s === 'accepted' || s === 'following' || data.is_following_back);
                            setCanMessage(hasFollow);
                          } else {
                            setCanMessage(false);
                          }
                          const prevStatus = prevFollowStatusRef.current;
                          if (prevStatus === 'not_following' && (s === 'accepted' || s === 'following')) {
                            useDirectoryStore.setState(state => ({
                              selectedProfessional: state.selectedProfessional ? {
                                ...state.selectedProfessional,
                                followersCount: (state.selectedProfessional.followersCount || 0) + 1
                              } : null
                            }));
                          } else if ((prevStatus === 'accepted' || prevStatus === 'following') && s === 'not_following') {
                            useDirectoryStore.setState(state => ({
                              selectedProfessional: state.selectedProfessional ? {
                                ...state.selectedProfessional,
                                followersCount: Math.max(0, (state.selectedProfessional.followersCount || 0) - 1)
                              } : null
                            }));
                          }
                          if (s !== 'loading' && s !== 'pending') {
                            prevFollowStatusRef.current = s;
                          }
                        }}
                      />
                      <BlockButton targetId={selectedProfessional._id} />
                    </div>
                    {canMessage ? (
                      <button
                        onClick={() => navigate(`/messages/${selectedProfessional._id}`)}
                        className="w-full border border-blue-200 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Message
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full border border-gray-200 bg-gray-50 text-gray-400 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                        title="Follow this builder to send messages"
                      >
                        <MessageCircle className="w-4 h-4" /> Message
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                <span>{officeAddress || 'Location hidden'}</span>
              </div>
              {serviceAreas.length > 0 && (
                <div className="text-sm text-gray-600">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Service Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {serviceAreas.map((area, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs">{area}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Verification</h3>
            <div className="space-y-3">
              {(() => {
                const isActive = builderProfile?.isProfileActive;
                return (
                  <div className={`flex items-center text-sm font-medium ${isActive ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'} px-3 py-2 rounded-lg`}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {isActive ? 'Profile Verified' : 'Verification Pending'}
                  </div>
                );
              })()}
              {builderProfile?.kycDetails?.gstin && (
                <div className="flex items-center text-sm text-indigo-600 font-medium">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  GST Registered
                </div>
              )}
              {builderProfile?.kycDetails?.reraRegistrationNumber && (
                <div className="flex items-center text-sm text-purple-600 font-medium">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  RERA Registered
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Professional Profile</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Experience</p>
                  <p className="text-gray-900 font-medium">{yearsOfExperience} Years</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Team Size</p>
                  <p className="text-gray-900 font-medium">{teamSize} members</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pricing</p>
                  <p className="text-gray-900 font-medium capitalize">{pricingModel}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {servicesOffered.length > 0 ?
                    servicesOffered.map((s, i) => (
                      <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-100">{s}</span>
                    )) : <span className="text-gray-400 italic text-sm">No services added yet</span>
                  }
                </div>
              </div>
            </div>
          </div>
          
          {/* Real Time Available Projects */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6 text-orange-600">
              <Activity className="w-5 h-5" />
              <h3 className="text-lg font-bold uppercase tracking-wider">Real TIme Available Projects</h3>
              <span className="ml-auto bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Active Now</span>
            </div>

            {isOwner && (
                <button 
                  onClick={() => navigate('/builder-projects/post')}
                  className="w-full mb-6 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" /> Post Real-Time Project
                </button>
            )}
            
            {realTimeProjects.length > 0 ? (
              <div className="space-y-4">
                {realTimeProjects.map((proj) => (
                  <div key={proj._id} className="group flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all cursor-pointer" onClick={() => navigate(`/builder-projects/${proj._id}`)}>
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {proj.media?.length > 0 ? (
                            <img src={proj.media[0].url} alt={proj.title} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-6 h-6 text-orange-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">{proj.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(proj.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {proj.location}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-black text-orange-600">₹{proj.budget?.toLocaleString() || 'N/A'}</span>
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Hiring</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                 <p className="text-gray-400 text-sm font-medium">No real-time projects listed by builder recently.</p>
              </div>
            )}
          </div>

          {/* Past Projects */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6">
              <FolderOpen className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Past Projects</h3>
              <span className="ml-auto text-sm text-gray-400 font-medium">{pastProjects.length} project{pastProjects.length !== 1 ? 's' : ''}</span>
            </div>
            {pastProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastProjects.map((project, idx) => (
                  <div key={idx} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-md">
                    {project.media?.length > 0 && (
                      <div className="h-40 w-full overflow-hidden">
                        <img src={project.media[0].url} alt={project.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    )}
                    {!project.media?.length && (
                      <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 leading-tight">{project.title}</h3>
                        {project.verificationStatus === 'verified' && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{project.description?.slice(0, 100)}{project.description?.length > 100 ? '...' : ''}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {project.projectType && (
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-100">{project.projectType}</span>
                        )}
                        {project.location && (
                          <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5" />{project.location}</span>
                        )}
                        {project.completionYear && (
                          <span>{project.completionYear}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 italic">No projects showcased yet.</p>}
          </div>

          {/* Rating */}
          {!isOwner && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Leave a Review</h2>
              <form onSubmit={handleRateSubmit} className="space-y-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}>
                      <Star className={`w-8 h-8 ${(hoverRating || rating) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows="3"
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border outline-none" placeholder="Share your experience..." />
                <button type="submit" disabled={ratingLoading || rating === 0}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center transition-colors">
                  {ratingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Submit Review
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
