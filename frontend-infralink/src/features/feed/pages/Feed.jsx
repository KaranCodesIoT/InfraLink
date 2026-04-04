import { useEffect, useState } from 'react';
import { 
  Plus, RefreshCw, AlertCircle, Newspaper, 
  Image as ImageIcon, Video, FileText, Send
} from 'lucide-react';
import useFeedStore from '../../../store/feed.store.js';
import useAuth from '../../../hooks/useAuth.js';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll.js';
import PostCard from '../components/PostCard.jsx';
import PostCardSkeleton from '../components/PostCardSkeleton.jsx';
import PostFormModal from '../../posts/components/PostFormModal.jsx';
import './Feed.css';

export default function Feed() {
  const { user } = useAuth();
  const { posts, isLoading, error, hasMore, fetchFeed, refreshFeed } = useFeedStore();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Initial fetch
  useEffect(() => {
    if (posts.length === 0) {
      fetchFeed(true);
    }
  }, []);

  // Infinite Scroll Hook
  const { lastElementRef } = useInfiniteScroll(
    () => fetchFeed(),
    hasMore,
    isLoading
  );

  const filters = [
    { id: 'all', label: 'All Posts', icon: Newspaper },
    { id: 'project_update', label: 'Projects', icon: FileText },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Video },
  ];

  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.contentType === activeFilter);

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 lg:px-0">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Feed</h1>
          <p className="text-sm text-gray-500 font-medium">Personalized for {user?.role}</p>
        </div>
        <button 
          onClick={() => refreshFeed()}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-white hover:text-orange-600 hover:shadow-sm border border-transparent hover:border-gray-100 transition-all group"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-orange-600' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>

      {/* Quick Post Box */}
      <div 
        onClick={() => setIsPostModalOpen(true)}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 cursor-pointer group hover:border-orange-200 transition-all"
      >
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
           </div>
           <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-500 text-sm group-hover:bg-gray-100 transition-colors">
              Share a project update or insight, {user?.name?.split(' ')[0]}...
           </div>
           <div className="p-2 bg-orange-600 rounded-lg text-white group-hover:bg-orange-700 transition-colors">
              <Plus className="w-5 h-5" />
           </div>
        </div>
        
        {/* Quick Type Selection */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
           {[
             { icon: FileText, label: 'Post Update', color: 'text-blue-500' },
             { icon: ImageIcon, label: 'Image', color: 'text-green-500' },
             { icon: Video, label: 'Video', color: 'text-purple-500' }
           ].map((item, i) => (
             <button key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                {item.label}
             </button>
           ))}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-orange-600 text-white shadow-md shadow-orange-100'
                : 'bg-white text-gray-600 border border-gray-100 hover:border-orange-200 shadow-sm'
            }`}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.map((post, index) => {
          const isLast = index === filteredPosts.length - 1;
          return (
            <div key={post._id} ref={isLast ? lastElementRef : null}>
              <PostCard post={post} />
            </div>
          );
        })}

        {/* Loading Skeletons */}
        {isLoading && (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">No posts found</h3>
             <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
               Try following more professionals in your industry to grow your network.
             </p>
             <button 
               onClick={() => refreshFeed()}
               className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm"
             >
               Explore Directory
             </button>
          </div>
        )}

        {/* End of Feed Message */}
        {!hasMore && filteredPosts.length > 0 && (
          <div className="py-12 text-center">
            <div className="flex justify-center mb-4">
               <div className="h-px bg-gray-200 flex-1 self-center" />
               <AlertCircle className="w-5 h-5 text-gray-300 mx-4" />
               <div className="h-px bg-gray-200 flex-1 self-center" />
            </div>
            <p className="text-sm font-bold text-gray-400">You've caught up with everything!</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <PostFormModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />

      {/* Error Toast Placeholder */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
