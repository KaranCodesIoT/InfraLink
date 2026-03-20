import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import { Loader2, MapPin, User, Mail, Phone, ArrowLeft, Star, Calendar, ShieldCheck, HardHat, Pencil } from 'lucide-react';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedProfessional, 
    getProfessionalById, 
    clearSelectedProfessional, 
    followBuilder, 
    unfollowBuilder, 
    rateBuilder,
    followContractor,
    unfollowContractor,
    rateContractor
  } = useDirectoryStore();
  const isLoading = useDirectoryStore(state => state.isLoading);
  const error = useDirectoryStore(state => state.error);
  const { user: currentUser } = useAuthStore();
  const [followLoading, setFollowLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const { toast } = useUIStore();

  const isOwner = !!(currentUser?._id && selectedProfessional?._id && 
    currentUser._id.toString() === selectedProfessional._id.toString());
  console.log('[ProfessionalProfile] isOwner:', isOwner, 'currentUser:', currentUser?._id, 'profile:', selectedProfessional?._id);

  const handleFollowToggle = async () => {
    if (!currentUser) return toast.error('Please log in to follow professionals');
    
    const isBuilder = role === 'builder';
    const profileId = isBuilder ? builderProfile?._id : contractorProfile?._id;
    
    if (!profileId) return toast.error(`${isBuilder ? 'Builder' : 'Contractor'} profile not found`);

    setFollowLoading(true);
    try {
      if (selectedProfessional.isFollowing) {
        if (isBuilder) {
          await unfollowBuilder(profileId);
        } else {
          await unfollowContractor(profileId);
        }
        toast.success(`Unfollowed ${displayName}`);
      } else {
        if (isBuilder) {
          await followBuilder(profileId);
        } else {
          await followContractor(profileId);
        }
        toast.success(`Following ${displayName}`);
      }
    } catch (err) {
      // Store handles error state
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error('Please log in to leave a review');
    
    const isBuilder = role === 'builder';
    const profileId = isBuilder ? builderProfile?._id : contractorProfile?._id;
    
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

  const { name, role, location, avatar, skills = [], createdAt, builderProfile, contractorProfile } = selectedProfessional;
  const displayName = builderProfile?.companyName || contractorProfile?.fullName || name;
  const onboardingPath = role === 'builder' ? '/builder-onboarding' : '/contractor-onboarding';

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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-3xl bg-orange-100 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-orange-600" />
                )}
              </div>
              
              <div className="text-center w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                  {!isOwner && (!!builderProfile || !!contractorProfile) && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex items-center justify-center py-1.5 px-4 rounded-lg text-sm font-bold transition-all ${
                        selectedProfessional.isFollowing 
                          ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                      } disabled:opacity-70`}
                    >
                      {followLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                      {selectedProfessional.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
                
                <p className="text-orange-600 font-medium capitalize text-xs bg-orange-50 inline-block px-3 py-1 rounded-full mb-4">
                  {builderProfile?.profileType || (role === 'contractor' ? 'Contractor' : role.replace('_', ' '))}
                </p>

                <div className="flex items-center justify-center gap-6 py-4 border-y border-gray-50 mb-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedProfessional.followersCount || 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Followers</p>
                  </div>
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                <span>{location?.city ? `${location.city}, ${location.state || ''}` : (contractorProfile?.address || 'Location hidden')}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm opacity-60">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span>{contractorProfile?.email || 'Email hidden for privacy'}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm opacity-60">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span>{contractorProfile?.phone || 'Phone hidden for privacy'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Verification</h3>
            <div className="space-y-3">
              {(builderProfile || (contractorProfile && contractorProfile.kycStatus === 'verified')) && (
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
        </div>

        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Step 1: Basic Information</h2>
              {isOwner && (
                <button onClick={() => navigate(`${onboardingPath}?step=1`)} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium transition-colors">
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
                    : (contractorProfile?.experience !== undefined ? `${contractorProfile.experience} years` : 'Not specified')}
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Step 2: KYC Verification</h2>
              {isOwner && (
                <button onClick={() => navigate(`${onboardingPath}?step=2`)} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium transition-colors">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Step 3: Professional Details</h2>
              {isOwner && (
                <button onClick={() => navigate(`${onboardingPath}?step=3`)} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium transition-colors">
                  <Pencil className="w-4 h-4 mr-1" /> Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
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

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Past Projects Gallery</p>
              {(builderProfile?.professionalDetails?.pastProjects?.length > 0 || contractorProfile?.professionalDetails?.portfolio?.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(builderProfile?.professionalDetails?.pastProjects || contractorProfile?.professionalDetails?.portfolio).map((project, idx) => (
                    <div key={idx} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 transition-all hover:shadow-md">
                      {project.images?.length > 0 && (
                        <div className="h-40 w-full overflow-hidden">
                          <img 
                            src={project.images[0]} 
                            alt={project.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 leading-tight">{project.title}</h3>
                        {project.location && (
                          <p className="text-xs text-gray-500 flex items-center mt-1.5">
                            <MapPin className="w-3 h-3 mr-1 text-orange-500" />
                            {project.location}
                          </p>
                        )}
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">No past projects showcased yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Rate & Review Section */}
          {!isOwner && (!!builderProfile || !!contractorProfile) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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

          <button className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-700 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
            Hire / Contact Professional
          </button>
        </div>
      </div>
    </div>
  );
}
