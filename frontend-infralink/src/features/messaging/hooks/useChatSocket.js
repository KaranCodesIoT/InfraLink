import { useEffect, useRef } from 'react';
import { getSocket, connectSocket } from '../../../lib/socket.js';
import useMessagingStore from '../store/message.store.js';
import useAuthStore from '../../../store/auth.store.js';

const EVENTS = {
    NEW_MESSAGE: 'chat:newMessage',
    NEW_REQUEST: 'chat:newMessageRequest',
    REQUEST_ACCEPTED: 'chat:requestAccepted',
    REQUEST_REJECTED: 'chat:requestRejected',
    MESSAGE_SEEN: 'chat:messageSeen',
    MESSAGE_DELIVERED: 'chat:messageDelivered',
    TYPING_STATUS: 'chat:typingStatus',
};

export default function useChatSocket(onTyping) {
    const user = useAuthStore((s) => s.user);
    const { addIncomingMessage, addIncomingRequest, updateMessageStatus, fetchConversations, fetchMessageRequests } =
        useMessagingStore();
    const listenersAttached = useRef(false);

    useEffect(() => {
        if (!user?._id) return;

        const socket = getSocket() || connectSocket();
        if (!socket || listenersAttached.current) return;

        // Join personal room for notifications
        socket.emit('chat:join', { roomId: `user:${user._id}` });

        // ─── Listeners ───────────────────────────────────────────────────────────
        socket.on(EVENTS.NEW_MESSAGE, ({ message }) => {
            if (message.sender !== user._id && message.sender?._id !== user._id) {
                addIncomingMessage(message);
            }
        });

        socket.on(EVENTS.NEW_REQUEST, ({ conversation }) => {
            addIncomingRequest(conversation);
        });

        socket.on(EVENTS.REQUEST_ACCEPTED, () => {
            fetchConversations();
            fetchMessageRequests();
        });

        socket.on(EVENTS.REQUEST_REJECTED, () => {
            fetchMessageRequests();
        });

        socket.on(EVENTS.MESSAGE_SEEN, ({ conversationId }) => {
            updateMessageStatus(conversationId, 'seen');
        });

        socket.on(EVENTS.MESSAGE_DELIVERED, ({ conversationId }) => {
            updateMessageStatus(conversationId, 'delivered');
        });

        socket.on(EVENTS.TYPING_STATUS, ({ socketId, isTyping }) => {
            onTyping?.(socketId, isTyping);
        });

        listenersAttached.current = true;

        return () => {
            socket.off(EVENTS.NEW_MESSAGE);
            socket.off(EVENTS.NEW_REQUEST);
            socket.off(EVENTS.REQUEST_ACCEPTED);
            socket.off(EVENTS.REQUEST_REJECTED);
            socket.off(EVENTS.MESSAGE_SEEN);
            socket.off(EVENTS.MESSAGE_DELIVERED);
            socket.off(EVENTS.TYPING_STATUS);
            listenersAttached.current = false;
        };
    }, [user?._id]);
}
