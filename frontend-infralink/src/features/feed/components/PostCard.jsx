import { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  MapPin, Calendar, Clock, CheckCircle2, User, DollarSign, Users, X, Loader2, ArrowRight
} from 'lucide-react';

import { formatDistanceToNowNative } from '../../../utils/dateFormatting.js';
import { useUIStore } from '../../../store/index.js';
import useAuth from '../../../hooks/useAuth.js';
import usePostsStore from '../../../store/posts.store.js';
import useFeedStore from '../../../store/feed.store.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const { user: currentUser } = useAuth();
  const { addComment, applyToProject, updateApplicationStatus } = usePostsStore();
  const { toggleLike } = useFeedStore();
  const { toast } = useUIStore();
  
  const [showComments, setShowComments] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const authorId = post.user?._id || post.user;
  const author = post.author || (post.user && typeof post.user === 'object' ? post.user : authorId);
  
  const isOwner = currentUser?._id && authorId && currentUser._id.toString() === authorId.toString();
  
  const initialHasApplied = post.applications?.some(app => 
    (app.user?._id || app.user).toString() === currentUser?._id?.toString()
  );
  
  const initialAppStatus = post.applications?.find(app => 
    (app.user?._id || app.user).toString() === currentUser?._id?.toString()
  )?.status;

  // Optimistic local state to prevent duplicate clicks across different stores
  const [localHasApplied, setLocalHasApplied] = useState(initialHasApplied);
  const [localAppStatus, setLocalAppStatus] = useState(initialAppStatus);

  const isLiked = post.likes?.includes(currentUser?._id);
  const timeAgo = formatDistanceToNowNative(post.createdAt);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await toggleLike(post._id, currentUser?._id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(post._id, commentText);
      setCommentText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleApply = async () => {
    if (!currentUser) return toast.error('Log in to apply for projects');
    setIsApplying(true);
    try {
      await applyToProject(post._id);
      
      // Update local state immediately so UI updates regardless of which Zustand store is active 
      setLocalHasApplied(true);
      setLocalAppStatus('pending');
      
      toast.success('Interest sent to project owner!');
    } catch (e) {
      toast.error(e?.response?.data?.error?.message || e.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };


  const contentThreshold = 200;
  const shouldTruncate = post.content.length > contentThreshold && !isExpanded;
  const displayContent = shouldTruncate 
    ? post.content.substring(0, contentThreshold) + '...' 
    : post.content;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 mb-6 overflow-hidden">
      {/* Project Management Header (Owner Only) */}
      {isOwner && post.projectName && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 flex items-center justify-between text-white">
           <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">Project Management Mode</span>
           </div>
           {post.applications?.length > 0 && (
             <button 
                onClick={() => setShowApplicants(true)}
                className="bg-white text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter hover:bg-orange-50 transition-colors shadow-sm"
             >
                {post.applications.length} Interested Labours • Review Now
             </button>
           )}
        </div>
      )}

      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${author?._id || author}`} className="group relative">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-orange-500 transition-colors">
              {author?.profileImage || author?.avatar ? (
                <img src={resolveAvatarUrl(author.profileImage || author.avatar)} alt={author?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold uppercase">
                  {author?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {author?.role === 'builder' && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            )}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${author?._id || author}`} className="font-bold text-gray-900 hover:text-orange-600 transition-colors">
                {author?.name || 'Infralink User'}
              </Link>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-widest">
                {author?.role || 'User'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
              {post.location && (
                <>
                  <span className="text-gray-300 px-1">•</span>
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Project-Specific Actions Bar (Call to Action) */}
      {post.projectName && !isOwner && ['labour', 'worker'].includes(currentUser?.role) && (
        <div className="px-4 pb-2">
          {localHasApplied ? (
            <div className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border ${
              localAppStatus === 'accepted' ? 'border-green-100 bg-green-50 text-green-700' : 
              localAppStatus === 'rejected' ? 'border-red-100 bg-red-50 text-red-600' :
              'border-orange-100 bg-orange-50 text-orange-700'
            }`}>
               <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Interest Sent: {localAppStatus}</span>
               </div>
               {localAppStatus === 'pending' && <span className="text-[10px] font-bold italic">Owner is reviewing</span>}
               {localAppStatus === 'accepted' && (
                 <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-green-700">Open Chat</button>
               )}
            </div>
          ) : (
            <button 
              onClick={handleApply}
              disabled={isApplying}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Apply for this Project
                </>
              )}
            </button>
          )}
        </div>
      )}



      {/* Post Content */}
      <div className="px-4 pb-3">

        {post.projectName && (
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="bg-orange-50 px-3 py-1 rounded-lg border border-orange-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-bold text-orange-900">Project: {post.projectName}</span>
            </div>
            {post.budgetRange && (
              <div className="bg-green-50 px-3 py-1 rounded-lg border border-green-100 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold text-green-900">{post.budgetRange}</span>
              </div>
            )}
            {post.duration && (
              <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">{post.duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Role Specific Quick Specs (Horizontal scrollable or flex) */}
        {post.roleSpecificDetails && Object.keys(post.roleSpecificDetails).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(post.roleSpecificDetails).slice(0, 3).map(([key, value]) => (
              value && (
                <div key={key} className="bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tighter">{key}:</span>
                  <span className="text-[11px] font-black text-indigo-900">{value}</span>
                </div>
              )
            ))}
            {Object.keys(post.roleSpecificDetails).length > 3 && (
              <span className="text-[10px] text-gray-400 font-bold self-center">+ More specs</span>
            )}
          </div>
        )}

        <p className="text-gray-800 leading-relaxed text-sm lg:text-base whitespace-pre-wrap">
          {displayContent}
        </p>

        {post.content.length > contentThreshold && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-600 text-sm font-semibold mt-1 hover:underline"
          >
            {isExpanded ? 'Show less' : 'See more'}
          </button>
        )}
      </div>

      {/* Media Preview */}
      {(post.image || post.video) && (
        <div className="relative mt-2">
           {post.image && (
             <img 
               src={post.image} 
               alt="Post content" 
               className="w-full h-auto max-h-[500px] object-cover bg-gray-50"
               loading="lazy"
             />
           )}
           {/* Video placeholder - would use a player here */}
           {post.video && !post.image && (
             <div className="w-full aspect-video bg-black flex items-center justify-center text-white text-sm font-medium">
               Video Content Preview
             </div>
           )}
           {post.isRecommended && (
              <div className="absolute top-3 left-3 bg-orange-600/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">
                Recommended
              </div>
           )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-2 flex items-center border-y border-gray-50">
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
            isLiked 
              ? 'text-red-500 bg-red-50 font-bold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current scale-110' : ''} transition-transform`} />
          <span>{post.likes?.length || 0}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
            showComments ? 'text-orange-600 bg-orange-50 font-bold' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments?.length || 0}</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50/50 p-4 animate-in fade-in slide-in-from-top-2">
          {/* Comment input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white">
               {currentUser?.avatar ? (
                 <img src={resolveAvatarUrl(currentUser.avatar)} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                   <User className="w-4 h-4" />
                 </div>
               )}
            </div>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..." 
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-orange-400 pr-12"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim()}
                className="absolute right-2 top-1.5 p-1 text-orange-600 disabled:text-gray-300 font-bold text-sm"
              >
                Post
              </button>
            </div>
          </form>

          {/* Comment list */}
          <div className="space-y-4">
             {post.comments?.length > 0 ? (
               post.comments.slice(-5).map((comment, i) => (
                 <div key={comment._id || i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      {comment.user?.avatar ? (
                        <img src={resolveAvatarUrl(comment.user.avatar)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs uppercase">
                          {comment.user?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white border border-gray-100 rounded-2xl px-3 py-2 shadow-sm inline-block">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-xs text-gray-900">{comment.user?.name || 'User'}</span>
                          <span className="text-[10px] text-gray-400">
                            {formatDistanceToNowNative(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    </div>
                 </div>
               ))
             ) : (
               <p className="text-center text-xs text-gray-400 py-2">No comments yet. Be the first to interaction!</p>
             )}
             {post.comments?.length > 5 && (
               <button className="text-xs text-orange-600 font-bold hover:underline pl-11">
                 View all {post.comments.length} comments
               </button>
             )}
          </div>
        </div>
      )}
      {/* Project Applicants Modal (Owner Only) */}
      {showApplicants && isOwner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Project Interests</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{post.projectName}</p>
                 </div>
                 <button 
                    onClick={() => setShowApplicants(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                 >
                    <X className="w-5 h-5 text-gray-400" />
                 </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {post.applications?.length > 0 ? (
                    post.applications.map((app) => {
                       const applicant = app.user;
                       const status = app.status;
                       
                       return (
                          <div key={app._id} className="bg-gray-50/50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between group hover:border-orange-200 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-orange-500 transition-colors">
                                   {applicant?.profileImage || applicant?.avatar ? (
                                     <img src={resolveAvatarUrl(applicant.profileImage || applicant.avatar)} className="w-full h-full object-cover" />
                                   ) : (
                                     <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold uppercase">
                                       {applicant?.name?.charAt(0) || '?'}
                                     </div>
                                   )}
                                </div>
                                <div>
                                   <p className="font-bold text-gray-900 leading-tight">{applicant?.name}</p>
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{applicant?.role}</p>
                                   {status !== 'pending' && (
                                     <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                       status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                     }`}>
                                       {status}
                                     </span>
                                   )}
                                </div>
                             </div>

                             {status === 'pending' && (
                                <div className="flex flex-col gap-2">
                                   <button 
                                      onClick={async () => {
                                        try {
                                          await updateApplicationStatus(post._id, app._id, 'accepted');
                                          toast.success(`Accepted ${applicant.name}`);
                                        } catch (e) {
                                          toast.error('Action failed');
                                        }
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                                   >
                                      Accept
                                   </button>
                                   <button 
                                      onClick={async () => {
                                        try {
                                          await updateApplicationStatus(post._id, app._id, 'rejected');
                                          toast.success(`Denied ${applicant.name}`);
                                        } catch (e) {
                                          toast.error('Action failed');
                                        }
                                      }}
                                      className="bg-white border border-red-100 text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                                   >
                                      Deny
                                   </button>
                                </div>
                             )}

                             {status === 'accepted' && (
                               <button className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-orange-100">Message</button>
                             )}
                          </div>
                       );
                    })
                 ) : (
                    <div className="text-center py-12">
                       <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No interests yet</p>
                    </div>
                 )}
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                 <p className="text-[10px] text-gray-400 font-medium text-center uppercase tracking-widest">Only Ravi Singhania can manage these requests</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

