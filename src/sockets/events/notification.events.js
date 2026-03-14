/**
 * Notification Socket Event Constants
 */
export const NOTIFICATION_SOCKET_EVENTS = {
    // Client → Server
    SUBSCRIBE: 'notification:subscribe',
    UNSUBSCRIBE: 'notification:unsubscribe',
    MARK_READ: 'notification:markRead',

    // Server → Client
    NEW: 'notification:new',
    UNREAD_COUNT: 'notification:unreadCount',
    ALL_READ: 'notification:allRead',
};
