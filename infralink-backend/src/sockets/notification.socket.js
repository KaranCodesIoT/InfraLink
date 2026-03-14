import { NOTIFICATION_SOCKET_EVENTS } from './events/notification.events.js';

export const registerNotificationSocket = (io, socket) => {
    socket.on(NOTIFICATION_SOCKET_EVENTS.SUBSCRIBE, ({ userId }) => {
        socket.join(`user:${userId}`);
    });

    socket.on(NOTIFICATION_SOCKET_EVENTS.UNSUBSCRIBE, ({ userId }) => {
        socket.leave(`user:${userId}`);
    });

    socket.on(NOTIFICATION_SOCKET_EVENTS.MARK_READ, ({ notificationId }) => {
        // Acknowledge read; actual DB update handled via REST API
        socket.emit(NOTIFICATION_SOCKET_EVENTS.MESSAGE_READ, { notificationId });
    });
};

export const sendNotification = (io, userId, notification) => {
    io.to(`user:${userId}`).emit(NOTIFICATION_SOCKET_EVENTS.NEW, notification);
};
