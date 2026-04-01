import { create } from 'zustand';
import api from '../lib/axios.js';

const usePostsStore = create((set) => ({
  posts: [],
  isLoading: false,
  error: null,
  pagination: null,

  fetchUserPosts: async (userId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/posts/user/${userId}`, { params: { page, limit: 10 } });
      set({
        posts: page === 1 ? data.data : [...(usePostsStore.getState().posts), ...data.data],
        pagination: data.pagination,
        isLoading: false
      });
      return data.data;
    } catch (e) {
      set({ error: e?.response?.data?.error?.message || 'Failed to load posts', isLoading: false });
      throw e;
    }
  },

  createPost: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set((state) => ({
        posts: [data.data, ...state.posts],
        isLoading: false
      }));
      return data.data;
    } catch (e) {
      set({ error: e?.response?.data?.error?.message || 'Failed to create post', isLoading: false });
      throw e;
    }
  },

  likePost: async (postId, currentUserId) => {
    // Optimistic update
    set((state) => ({
      posts: state.posts.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likes?.includes(currentUserId);
          const newLikes = hasLiked
            ? post.likes.filter(id => id !== currentUserId)
            : [...(post.likes || []), currentUserId];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    }));

    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      // Optionally update with server response to be perfectly in sync
      set((state) => ({
        posts: state.posts.map(post => 
          post._id === postId ? { ...post, likes: data.data.likes } : post
        )
      }));
    } catch (e) {
      // Revert optimism if needed (simple implementation ignores revert for now)
      usePostsStore.getState().fetchUserPosts(usePostsStore.getState().posts[0]?.user?._id || usePostsStore.getState().posts[0]?.user);
    }
  },

  addComment: async (postId, text) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text });
      set((state) => ({
        posts: state.posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), data.data]
            };
          }
          return post;
        })
      }));
      return data.data;
    } catch (e) {
      throw e;
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      set((state) => ({
        posts: state.posts.filter(post => post._id !== postId)
      }));
    } catch (e) {
      throw e;
    }
  },

  clearPosts: () => set({ posts: [], pagination: null, error: null })
}));

export default usePostsStore;
