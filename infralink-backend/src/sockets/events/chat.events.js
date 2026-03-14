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

    // Server → Client
    USER_JOINED: 'chat:userJoined',
    USER_LEFT: 'chat:userLeft',
    NEW_MESSAGE: 'chat:newMessage',
    TYPING_STATUS: 'chat:typingStatus',
    MESSAGE_READ: 'chat:messageRead',
};
