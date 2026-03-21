import api from '../../../lib/axios.js';

export const networkService = {
  // ---- FOLLOW ACTIONS ----
  followUser: async (targetId) => {
    const { data } = await api.post(`/network/follows/${targetId}`);
    return data;
  },
  unfollowUser: async (targetId) => {
    const { data } = await api.delete(`/network/follows/${targetId}`);
    return data;
  },
  withdrawRequest: async (targetId) => {
    const { data } = await api.delete(`/network/follows/withdraw/${targetId}`);
    return data;
  },
  removeFollower: async (followerId) => {
    const { data } = await api.delete(`/network/follows/followers/${followerId}`);
    return data;
  },

  // ---- REQUEST ACTIONS ----
  acceptRequest: async (requestId) => {
    const { data } = await api.post(`/network/follows/requests/${requestId}/accept`);
    return data;
  },
  rejectRequest: async (requestId) => {
    const { data } = await api.post(`/network/follows/requests/${requestId}/reject`);
    return data;
  },
  bulkAcceptAll: async () => {
    const { data } = await api.post(`/network/follows/requests/bulk/accept`);
    return data;
  },
  bulkRejectAll: async () => {
    const { data } = await api.post(`/network/follows/requests/bulk/reject`);
    return data;
  },

  // ---- BLOCK ACTIONS ----
  blockUser: async (targetId) => {
    const { data } = await api.post(`/network/blocks/${targetId}`);
    return data;
  },
  unblockUser: async (targetId) => {
    const { data } = await api.delete(`/network/blocks/${targetId}`);
    return data;
  },
  getBlockedList: async (limit = 20, cursor = '') => {
    const { data } = await api.get('/network/blocks', { params: { limit, cursor } });
    return data;
  },
  getBlockStatus: async (targetId) => {
    const { data } = await api.get(`/network/blocks/status/${targetId}`);
    return data;
  },

  // ---- PRIVACY & CONTEXT ----
  togglePrivacy: async (isPrivate) => {
    const { data } = await api.patch('/network/privacy', { isPrivate });
    return data;
  },
  fetchStatus: async (targetId) => {
    const { data } = await api.get(`/network/status/${targetId}`);
    return data;
  },

  // ---- LIST ACTIONS ----
  getFollowersList: async (targetId, limit = 20, cursor = '') => {
    const url = targetId ? `/network/follows/followers/${targetId}` : `/network/follows/followers`;
    const { data } = await api.get(url, { params: { limit, cursor } });
    return data;
  },
  getFollowingList: async (targetId, limit = 20, cursor = '') => {
    const url = targetId ? `/network/follows/following/${targetId}` : `/network/follows/following`;
    const { data } = await api.get(url, { params: { limit, cursor } });
    return data;
  },
  getIncomingRequestsList: async (limit = 20, cursor = '') => {
    const { data } = await api.get('/network/follows/requests/incoming', { params: { limit, cursor } });
    return data;
  },
  getOutgoingRequestsList: async (limit = 20, cursor = '') => {
    const { data } = await api.get('/network/follows/requests/outgoing', { params: { limit, cursor } });
    return data;
  },

  /**
   * Convenience: Check if two users are mutual followers.
   * Uses the existing status endpoint and extracts is_mutual.
   */
  checkMutualFollow: async (targetId) => {
    const { data } = await api.get(`/network/status/${targetId}`);
    return { isMutual: data.data?.is_mutual || false, isFollowingBack: data.data?.is_following_back || false };
  }
};
