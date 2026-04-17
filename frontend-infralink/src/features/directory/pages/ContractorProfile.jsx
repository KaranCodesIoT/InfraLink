import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDirectoryStore, useUIStore, useAuthStore } from '../../../store/index.js';
import usePostsStore from '../../../store/posts.store.js';
import { Loader2, MapPin, User, Mail, Phone, ArrowLeft, Star, Briefcase, ShieldCheck, PenTool, Pencil, Clock, DollarSign, MessageCircle, Users, CheckCircle2, RefreshCw, ImageIcon, FileText, Heart, Send, ImagePlus, X, PlusCircle, Trash2, Calendar } from 'lucide-react';
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

  // Fetch user posts
  const { posts, fetchUserPosts, clearPosts, isLoading: postsLoading, createPost, likePost, addComment, deletePost } = usePostsStore();
  
  // Create Post State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newPostData, setNewPostData] = useState({ 
    content: '', 
    projectName: '', 
    location: '', 
    image: null,
    budgetRange: '',
    startDate: '',
    duration: '',
    requiredWorkers: '',
    contactOption: 'In-App Message',
    roleSpecificDetails: {}
  });
  const [isPosting, setIsPosting] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchUserPosts(id).catch(() => {});
    }
    return () => clearPosts();
  }, [id, fetchUserPosts, clearPosts]);

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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 2) return;
    if (!newPostData.content && !newPostData.image) return toast.error('Post content or image is required');

    setIsPosting(true);
    try {
      const formData = new FormData();
      if (newPostData.content) formData.append('content', newPostData.content);
      if (newPostData.projectName) formData.append('projectName', newPostData.projectName);
      if (newPostData.location) formData.append('location', newPostData.location);
      if (newPostData.image) formData.append('image', newPostData.image);
      
      // New fields
      if (newPostData.budgetRange) formData.append('budgetRange', newPostData.budgetRange);
      if (newPostData.startDate) formData.append('startDate', newPostData.startDate);
      if (newPostData.duration) formData.append('duration', newPostData.duration);
      if (newPostData.requiredWorkers) formData.append('requiredWorkers', newPostData.requiredWorkers);
      if (newPostData.contactOption) formData.append('contactOption', newPostData.contactOption);
      
      // Role-specific details as JSON
      formData.append('roleSpecificDetails', JSON.stringify(newPostData.roleSpecificDetails));

      await createPost(formData);
      toast.success('Professional post created successfully!');
      setIsPostModalOpen(false);
      setCurrentStep(1);
      setNewPostData({ 
        content: '', 
        projectName: '', 
        location: '', 
        image: null,
        budgetRange: '',
        startDate: '',
        duration: '',
        requiredWorkers: '',
        contactOption: 'In-App Message',
        roleSpecificDetails: {}
      });
    } catch (err) {
      toast.error(err?.message || 'Error creating post');
    } finally {
      setIsPosting(false);
    }
  };

  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  
  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;
    try {
      await addComment(postId, commentText);
      setCommentText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId);
        toast.success("Post deleted successfully");
      } catch (err) {
        toast.error("Failed to delete post");
      }
    }
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
                    <button onClick={() => navigate('/contractor-onboarding?step=1&mode=edit_info')} className="text-orange-600 hover:text-orange-800 flex items-center text-xs font-medium transition-colors">
                      <Pencil className="w-3 h-3 mr-1" /> Edit Info
                    </button>
                  )}
                </div>
                <p className="text-indigo-600 font-semibold capitalize text-xs bg-indigo-50 inline-block px-3 py-1 rounded-full mb-4">
                  {selectedProfessional.contractorType || `${profDetails.skillLevel || 'Professional'} Contractor`}
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
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedProfessional.followingCount || 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Following</p>
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

                    <button
                      onClick={() => toast.success('Hire request feature coming soon!')}
                      className="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(234,88,12,0.3)] hover:shadow-[0_6px_16px_rgba(234,88,12,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 mt-3 flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                      <Briefcase className="w-4 h-4 relative z-10" /> 
                      <span className="relative z-10 uppercase tracking-wider">Hire Me</span>
                    </button>
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


        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Professional Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
                   <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Completed</p>
                   <p className="text-gray-900 font-medium">{contractorProfile?.completedProjects || 0}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                   <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ongoing</p>
                   <p className="text-gray-900 font-medium">{contractorProfile?.ongoingProjects || 0}</p>
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

            </div>
          </div>

          {/* Verification / KYC */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Verification / KYC</h3>
              {isOwner && (
                <button onClick={() => navigate('/contractor-onboarding?step=2&mode=edit_kyc')} className="text-orange-600 hover:text-orange-800 flex items-center text-sm font-medium transition-colors">
                  <Pencil className="w-4 h-4 mr-1.5" /> Edit KYC
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
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
                  <div className={`inline-flex items-center text-base font-medium ${cfg.color} ${cfg.bg} px-4 py-2.5 rounded-xl`}>
                    <ShieldCheck className="w-5 h-5 mr-2.5" />
                    {cfg.label}
                  </div>
                );
              })()}
              {contractorProfile?.kycDetails?.gstin && (
                <div className="inline-flex items-center text-base text-indigo-700 bg-indigo-50 font-medium px-4 py-2.5 rounded-xl">
                  <ShieldCheck className="w-5 h-5 mr-2.5" />
                  GST Verified
                </div>
              )}
            </div>
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

      {/* Full-Width Posts & Updates Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-6 h-6 text-orange-600" />
              Posts & Updates
            </h3>
            {isOwner && (
              <button onClick={() => setIsPostModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl font-medium transition-colors flex items-center shadow-sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                New Post
              </button>
            )}
          </div>

          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-8 pb-12">
              {posts.map((post) => (
                <div key={post._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-5 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                        {post.user?.avatar || post.user?.profileImage ? (
                          <img src={post.user.avatar || post.user.profileImage} alt={post.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center"><User className="w-6 h-6 text-blue-600"/></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{post.user?.name || 'Unknown User'}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {currentUser?._id === post.user?._id && (
                      <button 
                         onClick={() => handleDeletePost(post._id)}
                         className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                         title="Delete Post"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Post Image (Resized) */}
                  {post.image && (
                    <div className="w-full bg-gray-50 h-[300px] md:h-[400px] relative">
                      <img src={post.image} alt="Project Update" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="p-5 md:p-6 space-y-4">
                    {(post.projectName || post.location) && (
                      <div className="flex flex-wrap gap-3 mb-4">
                        {post.projectName && (
                          <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                             <h5 className="font-bold text-orange-900 text-sm">{post.projectName}</h5>
                          </div>
                        )}
                        {post.location && (
                          <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center">
                            <MapPin className="w-3 h-3 mr-1.5 text-gray-400" /> 
                            <span className="text-xs font-bold text-gray-600">{post.location}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rich Project Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {post.budgetRange && (
                        <div className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Budget</p>
                          <p className="text-sm font-bold text-gray-900">{post.budgetRange}</p>
                        </div>
                      )}
                      {post.duration && (
                        <div className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Duration</p>
                          <p className="text-sm font-bold text-gray-900">{post.duration}</p>
                        </div>
                      )}
                      {post.startDate && (
                        <div className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Start Date</p>
                          <p className="text-sm font-bold text-gray-900">{new Date(post.startDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {post.requiredWorkers > 0 && (
                        <div className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-1">Workers</p>
                          <p className="text-sm font-bold text-gray-900">{post.requiredWorkers} Required</p>
                        </div>
                      )}
                    </div>

                    {/* Role Specific Tech Specs */}
                    {post.roleSpecificDetails && Object.keys(post.roleSpecificDetails).length > 0 && (
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mb-6">
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-3">Technical Specifications</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          {Object.entries(post.roleSpecificDetails).map(([key, value]) => (
                            value && (
                              <div key={key} className="flex items-center justify-between py-1 border-b border-blue-100/30">
                                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-sm font-black text-blue-900">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    
                    <p className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => currentUser ? likePost(post._id, currentUser._id) : toast.error('Log in to like')} 
                        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-red-500"
                      >
                        <Heart className={`w-5 h-5 ${post.likes?.includes(currentUser?._id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                        <span className={post.likes?.includes(currentUser?._id) ? 'text-red-500' : 'text-gray-600'}>{post.likes?.length || 0}</span>
                      </button>
                      <button 
                        onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                        className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 text-sm font-medium transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments?.length || 0} Comments</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {activeCommentPost === post._id && (
                      <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
                        {post.comments?.length > 0 ? (
                          <div className="space-y-4 mb-4">
                            {post.comments.map((comment, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                  {comment.user?.avatar || comment.user?.profileImage ? (
                                    <img src={comment.user.avatar || comment.user.profileImage} alt="" className="w-full h-full object-cover" />
                                  ) : <User className="w-4 h-4 text-gray-400 m-2"/>}
                                </div>
                                <div className="bg-gray-50 px-4 py-2.5 rounded-2xl flex-1">
                                  <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-sm text-gray-900">{comment.user?.name}</span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic mb-4">No comments yet. Be the first to comment!</p>
                        )}
                        
                        {currentUser && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                              <input 
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-gray-50 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 pr-10"
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                              />
                            </div>
                            <button 
                              onClick={() => handleCommentSubmit(post._id)}
                              disabled={!commentText.trim()}
                              className="text-orange-600 disabled:text-gray-300 p-2 hover:bg-orange-50 rounded-full transition-colors"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">No Posts Yet</h4>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">This contractor hasn't shared any updates or project photos yet.</p>
              {isOwner && (
                <button onClick={() => setIsPostModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Create First Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Create Professional Post</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">Step {currentStep} of 2</p>
              </div>
              <button 
                onClick={() => {
                  setIsPostModalOpen(false);
                  setCurrentStep(1);
                }} 
                className="bg-white text-gray-400 hover:text-gray-900 p-2.5 rounded-2xl shadow-sm border border-gray-100 transition-all hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePostSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {currentStep === 1 ? (
                /* STEP 1: COMMON FIELDS */
                <div className="space-y-6 animate-in slide-in-from-left-5 duration-300">
                  <div className="group">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Project Image</label>
                    <div className="flex items-center justify-center w-full">
                      <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${newPostData.image ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                          {newPostData.image ? (
                            <>
                              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-3 text-orange-600">
                                <ImagePlus className="w-8 h-8" />
                              </div>
                              <p className="text-sm text-gray-900 font-bold truncate max-w-xs">{newPostData.image.name}</p>
                              <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-tighter">Click to change</p>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-10 h-10 mb-3 text-gray-300 group-hover:text-orange-400 transition-colors" />
                              <p className="text-sm text-gray-500 font-bold">Click to upload project photo</p>
                              <p className="text-[10px] text-gray-400 font-medium mt-1">PNG, JPG, JPEG (Max 5MB)</p>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setNewPostData({ ...newPostData, image: e.target.files[0] })} />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Project Title *</label>
                      <input 
                        required
                        type="text" 
                        value={newPostData.projectName} 
                        onChange={(e) => setNewPostData({ ...newPostData, projectName: e.target.value })} 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300" 
                        placeholder="e.g. Modern Villa Wiring" 
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Location *</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-300 absolute left-4 top-[1.1rem] group-focus-within:text-orange-500 transition-colors" />
                        <input 
                          required
                          type="text" 
                          value={newPostData.location} 
                          onChange={(e) => setNewPostData({ ...newPostData, location: e.target.value })} 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300" 
                          placeholder="City, State" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Budget Range</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-gray-300 absolute left-4 top-[1.1rem]" />
                        <input 
                          type="text" 
                          value={newPostData.budgetRange} 
                          onChange={(e) => setNewPostData({ ...newPostData, budgetRange: e.target.value })} 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all" 
                          placeholder="e.g. ₹50k - ₹1L" 
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Start Date</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-gray-300 absolute left-4 top-[1.1rem]" />
                        <input 
                          type="date" 
                          value={newPostData.startDate} 
                          onChange={(e) => setNewPostData({ ...newPostData, startDate: e.target.value })} 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Duration</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-gray-300 absolute left-4 top-[1.1rem]" />
                        <input 
                          type="text" 
                          value={newPostData.duration} 
                          onChange={(e) => setNewPostData({ ...newPostData, duration: e.target.value })} 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all" 
                          placeholder="e.g. 2 Weeks / 1 Month" 
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Required Workers</label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-gray-300 absolute left-4 top-[1.1rem]" />
                        <input 
                          type="number" 
                          value={newPostData.requiredWorkers} 
                          onChange={(e) => setNewPostData({ ...newPostData, requiredWorkers: e.target.value })} 
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all" 
                          placeholder="Total manpower" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Description / Caption *</label>
                    <textarea 
                      required
                      rows="4" 
                      value={newPostData.content} 
                      onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 resize-none" 
                      placeholder="Describe the project scope, materials used, or any special requirements..."
                    ></textarea>
                  </div>
                </div>
              ) : (
                /* STEP 2: ROLE-SPECIFIC FIELDS */
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                  <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100/50 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="p-2 bg-orange-100 rounded-xl text-orange-600">
                          <PlusCircle className="w-5 h-5" />
                       </span>
                       <div>
                          <h4 className="font-black text-gray-900 text-sm">{selectedProfessional.contractorType || 'Contractor'} Specifics</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Help clients understand your technical expertise</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Render dynamic fields based on contractorType */}
                    {(() => {
                      const role = selectedProfessional.contractorType || '';
                      // Define role specific fields inline for clarity
                      const fieldsByRole = {
                        'Electrical Contractor': [
                          { key: 'wiringType', label: 'Wiring Type', placeholder: 'concealed / open' },
                          { key: 'load', label: 'Load Capacity (kW)', placeholder: 'e.g. 10kW' },
                          { key: 'buildingType', label: 'Building Type', placeholder: 'Residential / Commercial' },
                          { key: 'safetySystem', label: 'Safety Requirements', placeholder: 'Earthing / RCCB info' }
                        ],
                        'Plumbing Contractor': [
                          { key: 'pipeMaterial', label: 'Pipe Material', placeholder: 'PVC, CPVC, GI' },
                          { key: 'systemType', label: 'Water System', placeholder: 'e.g. Direct / Tank' },
                          { key: 'bathrooms', label: 'Units (Baths/Kitchens)', placeholder: 'e.g. 5 units' },
                          { key: 'drainage', label: 'Drainage Work?', placeholder: 'Yes / No' }
                        ],
                        'Civil Contractor': [
                          { key: 'structure', label: 'Structure Type', placeholder: 'RCC / Steel' },
                          { key: 'floors', label: 'Number of Floors', placeholder: 'e.g. G+2' },
                          { key: 'area', label: 'Area (sq ft)', placeholder: 'e.g. 2000' },
                          { key: 'material', label: 'Material Provided?', placeholder: 'Labour only / With Mat' }
                        ],
                        'Painting Contractor': [
                          { key: 'areaSqft', label: 'Surface Area (sq ft)', placeholder: 'e.g. 5000' },
                          { key: 'application', label: 'Application', placeholder: 'Interior / Exterior' },
                          { key: 'paintType', label: 'Paint Quality', placeholder: 'Emulsion / Texture' }
                        ],
                        'Carpentry Contractor': [
                          { key: 'furnitureType', label: 'Furniture Type', placeholder: 'Custom / Modular' },
                          { key: 'unitCount', label: 'Number of Units', placeholder: 'e.g. 3 Wardrobes' },
                          { key: 'designType', label: 'Design Required?', placeholder: '2D / 3D Design info' }
                        ],
                        'Tiles & Marble Contractor': [
                          { key: 'flooringArea', label: 'Area (sq ft)', placeholder: 'e.g. 1200' },
                          { key: 'tileType', label: 'Material Type', placeholder: 'Vitrified / Italian Marble' },
                          { key: 'matProvided', label: 'Supply Status', placeholder: 'Only Labour / Both' }
                        ],
                        'HVAC Contractor (AC/Ventilation)': [
                          { key: 'acType', label: 'AC System', placeholder: 'Split / Centralized / VRV' },
                          { key: 'coverageArea', label: 'Coverage (sq ft)', placeholder: 'e.g. 2500' },
                          { key: 'serviceType', label: 'Service Type', placeholder: 'Installation / AMC' }
                        ],
                        'Fire Safety Contractor': [
                          { key: 'bldgType', label: 'Building Category', placeholder: 'High-rise / Warehouse' },
                          { key: 'systems', label: 'Required systems', placeholder: 'Sprinkler / Hydrant' }
                        ],
                        'MEP Contractor (Mechanical, Electrical, Plumbing)': [
                          { key: 'scope', label: 'Project Scope', placeholder: 'Full MEP / Partial' },
                          { key: 'projSize', label: 'Project Size', placeholder: 'Small / Medium / Mega' },
                          { key: 'integration', label: 'Integration needed?', placeholder: 'Yes / No' }
                        ]
                      };

                      const currentFields = fieldsByRole[role] || [
                        { key: 'experienceRequired', label: 'Expertise Level', placeholder: 'e.g. Advanced' },
                        { key: 'specialTools', label: 'Special Tools Used', placeholder: 'e.g. Laser Level' }
                      ];

                      return currentFields.map((f) => (
                        <div key={f.key} className="group">
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">{f.label}</label>
                          <input 
                            type="text" 
                            value={newPostData.roleSpecificDetails[f.key] || ''} 
                            onChange={(e) => setNewPostData({ 
                              ...newPostData, 
                              roleSpecificDetails: { ...newPostData.roleSpecificDetails, [f.key]: e.target.value } 
                            })} 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300" 
                            placeholder={f.placeholder} 
                          />
                        </div>
                      ));
                    })()}

                    <div className="group md:col-span-2">
                       <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-orange-600 transition-colors">Contact / Apply Preference</label>
                       <select 
                          value={newPostData.contactOption}
                          onChange={(e) => setNewPostData({ ...newPostData, contactOption: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                       >
                          <option value="In-App Message">Direct Message (In-App)</option>
                          <option value="Phone Call">Phone Call</option>
                          <option value="WhatsApp">WhatsApp Message</option>
                          <option value="Visit Site">Visit My Office/Site</option>
                       </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-100 mt-4">
                {currentStep === 2 && (
                  <button 
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-white border border-gray-200 text-gray-600 rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Back to Basic
                  </button>
                )}
                
                {currentStep === 1 ? (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!newPostData.projectName || !newPostData.location || !newPostData.content) {
                        return toast.error('Please fill required fields (Title, Location, Content)');
                      }
                      setCurrentStep(2);
                    }}

                    className="flex-1 bg-gray-900 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-black transition-all hover:shadow-xl active:scale-95 flex justify-center items-center gap-2"
                  >
                    Next: Technical Details <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isPosting} 
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_15px_30px_rgba(234,88,12,0.4)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isPosting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : '🚀 Publish Project Post'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
