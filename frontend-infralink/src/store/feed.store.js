import { create } from 'zustand';
import api from '../lib/axios.js';
import { feedService } from '../features/feed/api/feed.service.js';

const useFeedStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,

  fetchFeed: async (reset = false) => {
    const { page, posts, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });
    
    try {
      const currentPage = reset ? 1 : page;
      const data = await feedService.getFeed(currentPage);
      
      set({
        posts: reset ? data.data : [...posts, ...data.data],
        page: currentPage + 1,
        hasMore: data.pagination?.hasMore || false,
        isLoading: false,
        error: null // Reset error on success
      });
    } catch (e) {
      const errMsg = e?.response?.data?.error?.message || e.message || 'Failed to fetch feed';
      console.error('Feed Fetch Error:', e);
      set({ 
        error: errMsg, 
        isLoading: false 
      });
    }
  },

  refreshFeed: () => get().fetchFeed(true),

  /**
   * Optimistic update for liking a post within the feed context
   */
  updatePostLike: (postId, userId, likes) => {
      set((state) => ({
          posts: state.posts.map(post => 
              post._id === postId ? { ...post, likes } : post
          )
      }));
  },

  /**
   * Add a newly created post to the top of the feed
   */
  addPostToFeed: (post) => {
    set((state) => ({
      posts: [post, ...state.posts]
    }));
  },

  toggleLike: async (postId, currentUserId) => {
    const { posts } = get();
    // Optimistic
    const updatedPosts = posts.map(p => {
        if (p._id === postId) {
            const hasLiked = p.likes?.includes(currentUserId);
            const newLikes = hasLiked 
                ? p.likes.filter(id => id !== currentUserId)
                : [...(p.likes || []), currentUserId];
            return { ...p, likes: newLikes };
        }
        return p;
    });
    set({ posts: updatedPosts });

    try {
        const { data } = await api.post(`/posts/${postId}/like`);
        set((state) => ({
            posts: state.posts.map(p => 
                p._id === postId ? { ...p, likes: data.data.likes } : p
            )
        }));
    } catch (e) {
        // Rollback? Usually skip for simple demo
    }
  }
}));

export default useFeedStore;
