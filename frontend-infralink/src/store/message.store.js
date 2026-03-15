import { create } from 'zustand';
import api from '../lib/axios.js';
import { getErrorMessage } from '../utils/errorHandler.js';

const useMessageStore = create((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/messages/conversations');
      set({ conversations: data.data || [], isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      set({ messages: data.data || [], activeConversation: conversationId, isLoading: false });
    } catch (e) {
      set({ error: getErrorMessage(e), isLoading: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const { data } = await api.post(`/messages/${conversationId}`, { content });
      set((s) => ({ messages: [...s.messages, data.data] }));
      return data.data;
    } catch (e) {
      set({ error: getErrorMessage(e) });
      throw e;
    }
  },

  addIncomingMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  clearError: () => set({ error: null }),
}));

export default useMessageStore;
