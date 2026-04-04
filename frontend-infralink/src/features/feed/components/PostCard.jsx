import { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  MapPin, Calendar, Clock, CheckCircle2, User
} from 'lucide-react';
import { formatDistanceToNowNative } from '../../../utils/dateFormatting.js';
import useAuth from '../../../hooks/useAuth.js';
import usePostsStore from '../../../store/posts.store.js';
import useFeedStore from '../../../store/feed.store.js';
import { resolveAvatarUrl } from '../../../utils/avatarUrl.js';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const { user: currentUser } = useAuth();
  const { addComment } = usePostsStore();
  const { toggleLike } = useFeedStore();
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const author = post.author || post.user;
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

  const contentThreshold = 200;
  const shouldTruncate = post.content.length > contentThreshold && !isExpanded;
  const displayContent = shouldTruncate 
    ? post.content.substring(0, contentThreshold) + '...' 
    : post.content;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${author?._id}`} className="group relative">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-orange-500 transition-colors">
              {author?.avatar ? (
                <img src={resolveAvatarUrl(author.avatar)} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
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
              <Link to={`/profile/${author?._id}`} className="font-bold text-gray-900 hover:text-orange-600 transition-colors">
                {author?.name}
              </Link>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                {author?.role}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
              {post.location && (
                <>
                  <span className="text-gray-300">•</span>
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

      {/* Post Content */}
      <div className="px-4 pb-3">
        {post.projectName && (
            <div className="mb-2 text-sm font-semibold text-orange-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Project: {post.projectName}
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
    </div>
  );
}
