import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import { Loader2, MapPin, User, Mail, Phone, ArrowLeft, Star, Briefcase, ShieldCheck, PenTool, Pencil, Clock, DollarSign, MessageCircle } from 'lucide-react';
import FollowButton from '../../network/components/FollowButton.jsx';
import BlockButton from '../../network/components/BlockButton.jsx';
import useNetworkStore from '../../../store/network.store.js';
export default function ContractorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedProfessional, 
    getProfessionalById, 
    clearSelectedProfessional, 
    rateContractor 
  } = useDirectoryStore();
  
  const isLoading = useDirectoryStore(state => state.isLoading);
  const error = useDirectoryStore(state => state.error);
  const { user: currentUser } = useAuthStore();
  const { toast } = useUIStore();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const prevFollowStatusRef = useRef(null);

  useEffect(() => {
    getProfessionalById(id)
      .catch((err) => {
        console.error('[ContractorProfile] Error:', err);
        toast.error('Failed to load contractor profile');
      });
    return () => clearSelectedProfessional();
  }, [id, getProfessionalById, clearSelectedProfessional, toast]);

  const isOwner = !!(currentUser?._id && selectedProfessional?._id && 
    currentUser._id.toString() === selectedProfessional._id.toString());

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Please log in to leave a review');
    const contractorProfileId = selectedProfessional?.contractorProfile?._id || selectedProfessional?._id;
    if (rating === 0) return toast.error('Please select a star rating');

    setRatingLoading(true);
    try {
      await rateContractor(contractorProfileId, rating, reviewText);
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
        <p className="text-gray-500 mt-4">Loading contractor details...</p>
      </div>
    );
  }

  if (error || !selectedProfessional) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-red-700">{error || 'Contractor not found'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center text-sm font-medium text-red-700 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const { name, role, location, avatar, skills = [], contractorProfile } = selectedProfessional;
  const displayName = contractorProfile?.fullName || name;
  const profDetails = contractorProfile?.professionalDetails || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-3xl bg-orange-100 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
                {avatar || contractorProfile?.profileImage ? (
                  <img src={avatar || contractorProfile?.profileImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-orange-600" />
                )}
              </div>
              
              <div className="text-center w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                  {isOwner && (
                    <button onClick={() => navigate('/contractor-onboarding?step=1')} className="text-orange-600 hover:text-orange-800 flex items-center text-xs font-medium transition-colors">
                      <Pencil className="w-3 h-3 mr-1" /> Edit Info
                    </button>
                  )}
                </div>
                <p className="text-indigo-600 font-semibold capitalize text-xs bg-indigo-50 inline-block px-3 py-1 rounded-full mb-4">
                  {profDetails.skillLevel || 'Professional'} Contractor
                </p>

                <div className="flex items-center justify-center gap-6 py-4 border-y border-gray-50 mb-6">
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
                          // Instant optimistic UI update
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
                        title="Follow this user to send messages"
                      >
                        <MessageCircle className="w-4 h-4" /> Message
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                <span>{location?.city ? `${location.city}, ${location.state || ''}` : contractorProfile?.address || 'Location hidden'}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm opacity-60">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span>{contractorProfile?.email || 'Email hidden'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Verification</h3>
              {isOwner && (
                <button onClick={() => navigate('/contractor-onboarding?step=2')} className="text-orange-600 hover:text-orange-800 flex items-center text-xs font-medium transition-colors">
                  <Pencil className="w-3 h-3 mr-1" /> Edit KYC
                </button>
              )}
            </div>
            <div className="space-y-3">
              {(() => {
                const status = contractorProfile?.kycStatus || 'pending';
                const statusConfig = {
                  verified: { color: 'text-green-600', bg: 'bg-green-50', label: 'KYC Verified' },
                  rejected: { color: 'text-red-600', bg: 'bg-red-50', label: 'KYC Rejected' },
                  pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'KYC Pending' },
                  pending_verification: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'KYC Pending Verification' },
                };
                const cfg = statusConfig[status] || statusConfig.pending;
                return (
                  <div className={`flex items-center text-sm font-medium ${cfg.color} ${cfg.bg} px-3 py-2 rounded-lg`}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {cfg.label}
                  </div>
                );
              })()}
              {contractorProfile?.kycDetails?.gstin && (
                <div className="flex items-center text-sm text-indigo-600 font-medium">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  GST Verified
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Professional Profile</h2>
              {isOwner && (
                <button onClick={() => navigate('/contractor-onboarding?step=3')} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium transition-colors">
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                   <Clock className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Experience</p>
                   <p className="text-gray-900 font-medium">{contractorProfile?.experience || 0} Years</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                   <DollarSign className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pricing</p>
                   <p className="text-gray-900 font-medium capitalize">
                     {profDetails.pricing?.amount ? `${profDetails.pricing.amount} / ${profDetails.pricing.type}` : 'Negotiable'}
                   </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {(profDetails.services?.length > 0 || skills?.length > 0) ? 
                    (profDetails.services || skills).map((s, i) => (
                      <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-100">{s}</span>
                    )) : <span className="text-gray-400 italic text-sm">No services added yet</span>
                  }
                </div>
              </div>

              {profDetails.tools?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Tools & Equipment</p>
                  <div className="flex flex-wrap gap-2">
                    {profDetails.tools.map((t, i) => (
                      <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-sm border border-gray-100 flex items-center">
                        <PenTool className="w-3 h-3 mr-2" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider">Project Portfolio</h3>
            {profDetails.portfolio?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profDetails.portfolio.map((project, idx) => (
                  <div key={idx} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-md">
                    {project.images?.length > 0 && (
                      <div className="h-40 w-full overflow-hidden">
                        <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 leading-tight">{project.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> {project.location}
                      </p>
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
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border outline-none" placeholder="Share your experience..." />
                <button type="submit" disabled={ratingLoading || rating === 0}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center">
                  {ratingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Submit
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
