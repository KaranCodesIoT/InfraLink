import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import { Loader2, MapPin, User, Mail, Phone, ArrowLeft, Star, Calendar, ShieldCheck, HardHat, Pencil, MessageCircle, Camera, Users, Briefcase, Plus, CheckCircle2 } from 'lucide-react';
import FollowButton from '../../network/components/FollowButton.jsx';
import BlockButton from '../../network/components/BlockButton.jsx';
import useNetworkStore from '../../../store/network.store.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';
import BuilderProjectList from '../../builderProjects/components/BuilderProjectList.jsx';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedProfessional, 
    getProfessionalById, 
    clearSelectedProfessional, 
    rateBuilder,
    rateContractor
  } = useDirectoryStore();
  const isLoading = useDirectoryStore(state => state.isLoading);
  const error = useDirectoryStore(state => state.error);
  const { user: currentUser } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [builderProjects, setBuilderProjects] = useState([]);
  const avatarInputRef = useRef(null);
  const prevFollowStatusRef = useRef(null);
  const { toast } = useUIStore();
  const { uploadAvatar } = useAuthStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const isOwner = !!(currentUser?._id && selectedProfessional?._id && 
    currentUser._id.toString() === selectedProfessional._id.toString());
  console.log('[ProfessionalProfile] isOwner:', isOwner, 'currentUser:', currentUser?._id, 'profile:', selectedProfessional?._id);

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Please log in to leave a review');
    if (!selectedProfessional) return;

    const role = selectedProfessional.role;
    const isBuilder = role === 'builder';
    const profileId = isBuilder ? selectedProfessional.builderProfile?._id : selectedProfessional.contractorProfile?._id;
    
    if (!profileId) return toast.error(`${isBuilder ? 'Builder' : 'Contractor'} profile not found`);
    if (rating === 0) return toast.error('Please select a star rating');

    setRatingLoading(true);
    try {
      if (isBuilder) {
        await rateBuilder(profileId, rating, reviewText);
      } else {
        await rateContractor(profileId, rating, reviewText);
      }
      toast.success('Review submitted successfully!');
      setRating(0);
      setReviewText('');
    } catch (err) {} 
    finally { setRatingLoading(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setAvatarUploading(true);
    try {
      await uploadAvatar(currentUser._id, file);
      // Refresh the profile to show the new avatar
      await getProfessionalById(id);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to upload profile picture');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  useEffect(() => {
    getProfessionalById(id)
      .then(data => console.log('API Response for Professional:', data))
      .catch((err) => {
        console.error('Error fetching professional profile:', err);
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

  const { name, role, location, avatar, skills = [], createdAt, builderProfile, contractorProfile, workerProfile } = selectedProfessional;
  const displayName = builderProfile?.companyName || contractorProfile?.fullName || workerProfile?.fullName || name;
  const onboardingPath = role === 'builder' ? '/builder-onboarding' 
    : role === 'contractor' ? '/contractor-onboarding' 
    : role === 'worker' ? '/worker-onboarding'
    : '/profile/edit';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Directory
      </button>

      {/* Profile Header (Full Width for Builders, otherwise standard) */}
      <div className={`grid grid-cols-1 ${role !== 'builder' ? 'lg:grid-cols-3' : ''} gap-8 w-full`}>
        
        {/* Profile Info Sidebar / Header */}
        <div className={`space-y-6 ${role === 'builder' ? 'w-full' : ''}`}>
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden ${role === 'builder' ? 'flex flex-col md:flex-row items-center md:items-start gap-8' : ''}`}>
            
            <div className={`flex flex-col items-center ${role === 'builder' ? 'shrink-0' : ''}`}>
              <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-3xl bg-orange-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {avatar ? (
                    <img src={resolveAvatarUrl(avatar)} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-orange-600" />
                  )}
                </div>
                {isOwner && (
                  <>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all cursor-pointer"
                    >
                      {avatarUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>
            
            <div className={`text-center ${role === 'builder' ? 'md:text-left flex-1 w-full' : 'w-full'} min-w-0`}>
              <div className={`flex flex-col items-center ${role === 'builder' ? 'md:items-start md:flex-row justify-between' : 'justify-center'} gap-3 mb-1`}>
                <div className="min-w-0 max-w-full">
                  <h1 className="text-2xl font-bold text-gray-900 break-words">{displayName}</h1>
                  <p className="text-orange-600 font-medium capitalize text-xs bg-orange-50 inline-block px-3 py-1 rounded-full mt-2 mb-4">
                    {builderProfile?.profileType || (role === 'contractor' ? 'Contractor' : role.replace('_', ' '))}
                  </p>
                </div>

                {/* Follow / Block / Message Actions */}
                {!isOwner && selectedProfessional?._id && (
                  <div className={`space-y-2 pt-2 ${role === 'builder' ? 'min-w-[140px]' : 'w-full max-w-[220px]'}`}>
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
                        title="Follow this user to send messages"
                      >
                        <MessageCircle className="w-4 h-4" /> Message
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className={`flex flex-wrap items-center ${role === 'builder' ? 'md:justify-start' : 'justify-center'} gap-4 py-4 border-y border-gray-50 mb-6`}>
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
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedProfessional.followingCount || 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Following</p>
                </div>
                
                {role === 'builder' && (
                  <>
                    <div className="text-center pl-2 border-l border-gray-100">
                      <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                        <HardHat className="w-4 h-4 text-amber-500 mr-1" />
                        {builderProjects.filter(p => !['Ready to Move', 'Completed'].includes(p.projectStatus)).length}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Ongoing Projects</p>
                    </div>
                    <div className="text-center pl-2 border-l border-gray-100">
                      <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1" />
                        {builderProjects.filter(p => ['Ready to Move', 'Completed'].includes(p.projectStatus)).length}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Completed Projects</p>
                    </div>
                  </>
                )}
              </div>

              <div className={`flex flex-col ${role === 'builder' ? 'md:flex-row md:gap-8' : 'gap-4'} items-center text-gray-600 text-sm`}>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-3 md:mr-2 text-gray-400" />
                  <span>{location?.city ? `${location.city}, ${location.state || ''}` : (contractorProfile?.address || 'Location hidden')}</span>
                </div>
                <div className="flex items-center opacity-60">
                  <Mail className="w-4 h-4 mr-3 md:mr-2 text-gray-400" />
                  <span>{contractorProfile?.email || 'Email hidden for privacy'}</span>
                </div>
                <div className="flex items-center opacity-60">
                  <Phone className="w-4 h-4 mr-3 md:mr-2 text-gray-400" />
                  <span>{contractorProfile?.phone || 'Phone hidden for privacy'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Box - HIDDEN FOR BUILDERS */}
          {role !== 'builder' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Verification</h3>
              <div className="space-y-3">
                {(contractorProfile && contractorProfile.kycStatus === 'verified') && (
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Identity Verified
                  </div>
                )}
                {contractorProfile && contractorProfile.kycStatus && contractorProfile.kycStatus !== 'verified' && (
                  <div className={`flex items-center text-sm font-medium ${
                    contractorProfile.kycStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    KYC {contractorProfile.kycStatus.replace('_', ' ')}
                  </div>
                )}
                {builderProfile?.kycDetails?.reraRegistrationNumber && (
                    <div className="flex items-center text-sm text-blue-600 font-medium">
                      <HardHat className="w-4 h-4 mr-2" />
                      RERA Registered
                    </div>
                )}
                {(builderProfile?.kycDetails?.gstin || contractorProfile?.kycDetails?.gstin) && (
                    <div className="flex items-center text-sm text-indigo-600 font-medium">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      GST Verified
                    </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {role !== 'builder' ? (
          <div className="lg:col-span-2 space-y-6 w-full">
            {/* Step 1: Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-lg font-bold text-gray-900">Step 1: Basic Information</h2>
                {isOwner && (
                  <button onClick={() => navigate(`${onboardingPath}?step=1&mode=edit_info`)} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium transition-colors">
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Company / Contractor Name</p>
                  <p className="font-medium text-gray-900">{builderProfile?.companyName || contractorProfile?.fullName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Profile Type</p>
                  <p className="font-medium text-gray-900">{builderProfile?.profileType || (role === 'contractor' ? 'Contractor' : role.replace('_', ' '))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Experience</p>
                  <p className="font-medium text-gray-900">
                    {builderProfile?.yearsOfExperience !== undefined 
                      ? `${builderProfile.yearsOfExperience} years` 
                      : (contractorProfile?.experience !== undefined ? `${contractorProfile.experience} years` : 
                        (workerProfile?.yearsOfExperience !== undefined ? `${workerProfile.yearsOfExperience} years` : 'Not specified'))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Service Areas</p>
                  <p className="font-medium text-gray-900">
                    {builderProfile?.serviceAreas?.join(', ') || contractorProfile?.serviceAreas?.join(', ') || 'Not specified'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Office Address</p>
                  <p className="font-medium text-gray-900">{builderProfile?.officeAddress || contractorProfile?.address || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Step 2: KYC Verification */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-lg font-bold text-gray-900">Step 2: KYC Verification</h2>
                {isOwner && (
                  <button onClick={() => navigate(`${onboardingPath}?step=2&mode=edit_kyc`)} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium transition-colors">
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Aadhaar Number</p>
                  <p className="font-medium text-gray-900">
                    {builderProfile?.kycDetails?.aadhaarNumber || contractorProfile?.kycDetails?.aadhaarLast4 || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">PAN Number</p>
                  <p className="font-medium text-gray-900">
                    {builderProfile?.kycDetails?.panNumber || contractorProfile?.kycDetails?.panNumber || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">GSTIN</p>
                  <p className="font-medium text-gray-900">
                    {builderProfile?.kycDetails?.gstin || contractorProfile?.kycDetails?.gstin || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">RERA Registration</p>
                  <p className="font-medium text-gray-900">{builderProfile?.kycDetails?.reraRegistrationNumber || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Step 3: Professional Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-lg font-bold text-gray-900">Step 3: Professional Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Pricing</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {builderProfile?.professionalDetails?.pricingModel || 
                      (contractorProfile?.professionalDetails?.pricing?.amount 
                        ? `₹${contractorProfile.professionalDetails.pricing.amount} / ${contractorProfile.professionalDetails.pricing.type}`
                        : 'Not specified')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">{role === 'builder' ? 'Team Size' : 'Skill Level'}</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {builderProfile?.professionalDetails?.teamSize || contractorProfile?.professionalDetails?.skillLevel || 'Not specified'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Services Offered / Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? skills.map((s, i) => (
                      <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-100">{s}</span>
                    )) : <span className="text-gray-400 italic text-sm">Not specified</span>}
                  </div>
                </div>
                {contractorProfile?.professionalDetails?.tools?.length > 0 && (
                  <div className="col-span-2 mt-2">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Tools & Equipment</p>
                    <div className="flex flex-wrap gap-2">
                      {contractorProfile.professionalDetails.tools.map((tool, i) => (
                        <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-100 italic">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Builder Project List (Full Width for Builders) */}
            {selectedProfessional?._id && <BuilderProjectList builderId={selectedProfessional._id} onProjectsLoaded={setBuilderProjects} />}
          </div>
        )}
      </div>

      {/* Rate & Review Section (Full Width below everything) */}
      {!isOwner && (!!builderProfile || !!contractorProfile || !!workerProfile) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Rate & Review</h2>
          <form onSubmit={handleRateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="3"
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border outline-none"
                placeholder={`Describe your experience with this ${role === 'builder' ? 'builder' : 'contractor'}...`}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={ratingLoading || rating === 0}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center shadow-md shadow-indigo-100"
            >
              {ratingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
