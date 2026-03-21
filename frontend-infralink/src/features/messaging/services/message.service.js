import api from '../../../lib/axios.js';

// ─── Conversations ────────────────────────────────────────────────────────────

export const getConversations = () => api.get('/messages/conversations');

export const getMessageRequests = () => api.get('/messages/requests');

export const getMessages = (conversationId, params = {}) =>
    api.get(`/messages/conversations/${conversationId}`, { params });

// ─── Message Requests ─────────────────────────────────────────────────────────

export const sendMessageRequest = (data) => api.post('/messages/request', data);

export const acceptMessageRequest = (conversationId) =>
    api.patch(`/messages/request/${conversationId}/accept`);

export const rejectMessageRequest = (conversationId) =>
    api.patch(`/messages/request/${conversationId}/reject`);

// ─── Direct Messaging ─────────────────────────────────────────────────────────

export const uploadAttachments = (formData) => api.post('/messages/send/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const sendMessage = (data) => api.post('/messages/send', data);

export const getOrCreateConversation = (data) => api.post('/messages/conversation', data);

// ─── Delivery Status ──────────────────────────────────────────────────────────

export const markSeen = (conversationId) =>
    api.patch(`/messages/seen/${conversationId}`);
