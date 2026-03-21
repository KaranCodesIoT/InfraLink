/**
 * Chat Socket Event Constants
 * Shared between the socket handler and any client-side code.
 */
export const CHAT_EVENTS = {
    // Client → Server
    JOIN: 'chat:join',
    LEAVE: 'chat:leave',
    SEND_MESSAGE: 'chat:message',
    TYPING: 'chat:typing',
    STOP_TYPING: 'chat:stopTyping',
    MARK_READ: 'chat:markRead',
    MARK_SEEN: 'chat:markSeen',
    MARK_DELIVERED: 'chat:markDelivered',
    MESSAGE_REQUEST: 'chat:messageRequest',
    ACCEPT_REQUEST: 'chat:acceptRequest',
    REJECT_REQUEST: 'chat:rejectRequest',

    // Server → Client
    USER_JOINED: 'chat:userJoined',
    USER_LEFT: 'chat:userLeft',
    NEW_MESSAGE: 'chat:newMessage',
    TYPING_STATUS: 'chat:typingStatus',
    MESSAGE_READ: 'chat:messageRead',
    MESSAGE_SEEN: 'chat:messageSeen',
    MESSAGE_DELIVERED: 'chat:messageDelivered',
    NEW_MESSAGE_REQUEST: 'chat:newMessageRequest',
    REQUEST_ACCEPTED: 'chat:requestAccepted',
    REQUEST_REJECTED: 'chat:requestRejected',
};
