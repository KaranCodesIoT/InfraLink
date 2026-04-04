import api from '../../../lib/axios.js';

export const feedService = {
  /**
   * Fetch personalized feed posts
   * @param {number} page
   * @param {number} limit
   */
  getFeed: async (page = 1, limit = 15) => {
    const { data } = await api.get('/feed', { params: { page, limit } });
    return data;
  }
};
