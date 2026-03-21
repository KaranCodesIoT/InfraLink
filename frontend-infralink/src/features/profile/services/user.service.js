import api from '../../../lib/axios.js';

export const userService = {
  getUserProfile: async (userId) => {
    // Assuming a standard GET /users/:id route exists on the backend
    const { data } = await api.get(`/users/${userId}`);
    return data;
  }
};
