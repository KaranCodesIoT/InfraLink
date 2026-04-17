import { create } from 'zustand';
import * as messageSvc from '../services/message.service.js';
import { getErrorMessage } from '../../../utils/errorHandler.js';

const useMessagingStore = create((set, get) => ({
    // ─── State ──────────────────────────────────────────────────────────────────
    conversations: [],
    messageRequests: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    isLoadingMessages: false,
    error: null,
    pagination: null,
    activeTab: 'chats', // 'chats' | 'requests'

    // ─── Conversations ──────────────────────────────────────────────────────────
    fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await messageSvc.getConversations();
            set({ conversations: data.data || [], isLoading: false });
        } catch (e) {
            set({ error: getErrorMessage(e), isLoading: false });
        }
    },

    fetchMessageRequests: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await messageSvc.getMessageRequests();
            set({ messageRequests: data.data || [], isLoading: false });
        } catch (e) {
            set({ error: getErrorMessage(e), isLoading: false });
        }
    },

    // ─── Messages ───────────────────────────────────────────────────────────────
    fetchMessages: async (conversationId) => {
        set({ isLoadingMessages: true, error: null });
        try {
            const { data } = await messageSvc.getMessages(conversationId);
            const msgData = data.data || {};
            set({
                messages: (msgData.messages || []).reverse(),
                activeConversation: msgData.conversation || { _id: conversationId },
                pagination: data.pagination || null,
                isLoadingMessages: false,
            });
        } catch (e) {
            set({ error: getErrorMessage(e), isLoadingMessages: false });
        }
    },

    // ─── Send Message ───────────────────────────────────────────────────────────
    sendMessage: async (conversationId, text, attachments = []) => {
        try {
            let finalAttachments = [];

            // 1. Separate new files (need upload) from already uploaded ones (if any)
            const filesToUpload = attachments.filter((a) => a.file);
            const existingAttachments = attachments.filter((a) => !a.file).map((a) => ({ url: a.url, type: a.type, name: a.name, size: a.size }));

            // 2. Upload new files
            if (filesToUpload.length > 0) {
                const formData = new FormData();
                filesToUpload.forEach((a) => formData.append('attachments', a.file));
                
                const { data: uploadRes } = await messageSvc.uploadAttachments(formData);
                if (uploadRes.success && uploadRes.data) {
                    finalAttachments = [...existingAttachments, ...uploadRes.data];
                } else {
                    finalAttachments = existingAttachments;
                }
            } else {
                finalAttachments = existingAttachments;
            }

            // 3. Send the actual message (only include attachments if non-empty)
            const payload = { conversationId, text };
            if (finalAttachments.length > 0) payload.attachments = finalAttachments;
            const { data } = await messageSvc.sendMessage(payload);
            set((s) => {
                if (s.messages.some(m => String(m._id) === String(data.data._id))) return s;
                return { messages: [...s.messages, data.data] };
            });
            // Update last message in conversation list
            set((s) => ({
                conversations: s.conversations.map((c) =>
                    String(c._id) === String(conversationId) ? { ...c, lastMessage: data.data, updatedAt: new Date().toISOString() } : c
                ),
            }));
            return data.data;
        } catch (e) {
            set({ error: getErrorMessage(e) });
            throw e;
        }
    },

    // ─── Message Request ────────────────────────────────────────────────────────
    sendMessageRequest: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await messageSvc.sendMessageRequest(payload);
            set({ isLoading: false });
            return data.data;
        } catch (e) {
            set({ error: getErrorMessage(e), isLoading: false });
            throw e;
        }
    },

    acceptRequest: async (conversationId) => {
        try {
            await messageSvc.acceptMessageRequest(conversationId);
            set((s) => ({
                messageRequests: s.messageRequests.filter((r) => r._id !== conversationId),
                activeConversation: s.activeConversation?._id === conversationId
                    ? { ...s.activeConversation, isRequest: false, isAccepted: true }
                    : s.activeConversation,
            }));
            // Refresh conversations
            get().fetchConversations();
        } catch (e) {
            set({ error: getErrorMessage(e) });
            throw e;
        }
    },

    rejectRequest: async (conversationId) => {
        try {
            await messageSvc.rejectMessageRequest(conversationId);
            set((s) => ({
                messageRequests: s.messageRequests.filter((r) => r._id !== conversationId),
                activeConversation: s.activeConversation?._id === conversationId ? null : s.activeConversation,
                messages: s.activeConversation?._id === conversationId ? [] : s.messages,
            }));
        } catch (e) {
            set({ error: getErrorMessage(e) });
            throw e;
        }
    },

    // ─── Mark Seen ──────────────────────────────────────────────────────────────
    markSeen: async (conversationId) => {
        try {
            await messageSvc.markSeen(conversationId);
            set((s) => ({
                messages: s.messages.map((m) =>
                    m.conversation === conversationId && m.status !== 'seen'
                        ? { ...m, status: 'seen', seenAt: new Date().toISOString() }
                        : m
                ),
            }));
        } catch {
            // silent
        }
    },

    // ─── Real-Time Handlers ─────────────────────────────────────────────────────
    addIncomingMessage: (message) => {
        const { activeConversation } = get();
        const msgConvId = String(message.conversation);
        if (activeConversation && msgConvId === String(activeConversation._id)) {
            set((s) => {
                if (s.messages.some(m => String(m._id) === String(message._id))) return s;
                return { messages: [...s.messages, message] };
            });
        }
        // Update conversation list
        set((s) => ({
            conversations: s.conversations.map((c) =>
                String(c._id) === msgConvId
                    ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() }
                    : c
            ),
        }));
    },

    addIncomingRequest: (conversation) => {
        set((s) => ({
            messageRequests: [conversation, ...s.messageRequests.filter((r) => r._id !== conversation._id)],
        }));
    },

    updateMessageStatus: (conversationId, status) => {
        set((s) => ({
            messages: s.messages.map((m) =>
                m.conversation === conversationId ? { ...m, status } : m
            ),
        }));
    },

    // ─── UI ─────────────────────────────────────────────────────────────────────
    setActiveTab: (tab) => set({ activeTab: tab }),
    setActiveConversation: (conv) => set({ activeConversation: conv }),
    clearMessages: () => set({ messages: [], activeConversation: null }),
    clearError: () => set({ error: null }),
}));

export default useMessagingStore;
