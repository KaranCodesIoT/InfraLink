import { CHAT_EVENTS } from './events/chat.events.js';
import * as messageService from '../modules/messaging/message.service.js';
import logger from '../utils/logger.js';

export const registerChatSocket = (io, socket) => {
    // ─── Join a conversation room ─────────────────────────────────────────────
    socket.on(CHAT_EVENTS.JOIN, ({ roomId }) => {
        socket.join(roomId);
        socket.to(roomId).emit(CHAT_EVENTS.USER_JOINED, { socketId: socket.id });
    });

    // ─── Send message (real-time relay + DB persist) ──────────────────────────
    socket.on(CHAT_EVENTS.SEND_MESSAGE, async ({ roomId, conversationId, text, attachments, senderId }) => {
        try {
            const message = await messageService.sendMessage(senderId, {
                conversationId,
                text,
                attachments,
            });

            // Emit to all in the room
            io.to(roomId).emit(CHAT_EVENTS.NEW_MESSAGE, {
                message,
                from: senderId,
                timestamp: new Date(),
            });

            // Also emit to recipient's personal room for notifications
            const { Conversation } = await import('../modules/messaging/message.model.js');
            const conv = await Conversation.findById(conversationId);
            if (conv) {
                const recipientId = conv.participants.find(
                    (p) => p.toString() !== senderId.toString()
                );
                if (recipientId) {
                    io.to(`user:${recipientId}`).emit(CHAT_EVENTS.NEW_MESSAGE, {
                        message,
                        conversationId,
                        from: senderId,
                        timestamp: new Date(),
                    });
                }
            }
        } catch (err) {
            socket.emit('chat:error', { message: err.message, code: err.code });
        }
    });

    // ─── Message Request ──────────────────────────────────────────────────────
    socket.on(CHAT_EVENTS.MESSAGE_REQUEST, async ({ senderId, recipientId, text, projectContext, workIntent }) => {
        try {
            const result = await messageService.sendMessageRequest(senderId, {
                recipientId,
                text,
                projectContext,
                workIntent,
            });

            // Notify recipient in real-time
            io.to(`user:${recipientId}`).emit(CHAT_EVENTS.NEW_MESSAGE_REQUEST, {
                conversation: result.conversation,
                message: result.message,
                from: senderId,
            });

            // Acknowledge sender
            socket.emit(CHAT_EVENTS.NEW_MESSAGE_REQUEST, {
                conversation: result.conversation,
                message: result.message,
                status: 'sent',
            });
        } catch (err) {
            socket.emit('chat:error', { message: err.message, code: err.code });
        }
    });

    // ─── Accept Request ───────────────────────────────────────────────────────
    socket.on(CHAT_EVENTS.ACCEPT_REQUEST, async ({ conversationId, userId }) => {
        try {
            const conversation = await messageService.acceptMessageRequest(conversationId, userId);
            const requesterId = conversation.participants.find(
                (p) => p.toString() !== userId.toString()
            );

            // Notify requester
            io.to(`user:${requesterId}`).emit(CHAT_EVENTS.REQUEST_ACCEPTED, { conversationId });
            socket.emit(CHAT_EVENTS.REQUEST_ACCEPTED, { conversationId });
        } catch (err) {
            socket.emit('chat:error', { message: err.message, code: err.code });
        }
    });

    // ─── Reject Request ───────────────────────────────────────────────────────
    socket.on(CHAT_EVENTS.REJECT_REQUEST, async ({ conversationId, userId }) => {
        try {
            const conversation = await messageService.rejectMessageRequest(conversationId, userId);
            const requesterId = conversation.participants.find(
                (p) => p.toString() !== userId.toString()
            );

            io.to(`user:${requesterId}`).emit(CHAT_EVENTS.REQUEST_REJECTED, { conversationId });
            socket.emit(CHAT_EVENTS.REQUEST_REJECTED, { conversationId });
        } catch (err) {
            socket.emit('chat:error', { message: err.message, code: err.code });
        }
    });

    // ─── Mark Seen ────────────────────────────────────────────────────────────
    socket.on(CHAT_EVENTS.MARK_SEEN, async ({ conversationId, userId, roomId }) => {
        try {
            await messageService.markSeen(conversationId, userId);
            // Notify the other participant
            if (roomId) {
                socket.to(roomId).emit(CHAT_EVENTS.MESSAGE_SEEN, { conversationId, seenBy: userId });
            }
            io.to(`user:${userId}`).emit(CHAT_EVENTS.MESSAGE_SEEN, { conversationId, seenBy: userId });
        } catch (err) {
            logger.error(`markSeen socket error: ${err.message}`);
        }
    });

    // ─── Mark Delivered ───────────────────────────────────────────────────────
    socket.on(CHAT_EVENTS.MARK_DELIVERED, async ({ conversationId, userId, roomId }) => {
        try {
            await messageService.markDelivered(conversationId, userId);
            if (roomId) {
                socket.to(roomId).emit(CHAT_EVENTS.MESSAGE_DELIVERED, { conversationId, deliveredTo: userId });
            }
        } catch (err) {
            logger.error(`markDelivered socket error: ${err.message}`);
        }
    });

    // ─── Typing ───────────────────────────────────────────────────────────────
    socket.on(CHAT_EVENTS.TYPING, ({ roomId, isTyping }) => {
        socket.to(roomId).emit(CHAT_EVENTS.TYPING_STATUS, { socketId: socket.id, isTyping });
    });

    socket.on(CHAT_EVENTS.STOP_TYPING, ({ roomId }) => {
        socket.to(roomId).emit(CHAT_EVENTS.TYPING_STATUS, { socketId: socket.id, isTyping: false });
    });

    // ─── Leave ────────────────────────────────────────────────────────────────
    socket.on(CHAT_EVENTS.LEAVE, ({ roomId }) => {
        socket.leave(roomId);
        socket.to(roomId).emit(CHAT_EVENTS.USER_LEFT, { socketId: socket.id });
    });
};
