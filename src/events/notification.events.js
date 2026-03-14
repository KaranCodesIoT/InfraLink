/**
 * Notification Domain Events
 * Provides a single `notification:send` channel that persists + pushes via socket.
 */
import eventBus from './eventBus.js';
import logger from '../utils/logger.js';

export const NOTIFICATION_EVENTS = {
    SEND: 'notification:send',
    READ: 'notification:read',
    READ_ALL: 'notification:readAll',
};

eventBus.on(NOTIFICATION_EVENTS.SEND, async (payload) => {
    const { userId, title, body, type, metadata } = payload;
    logger.info(`[Event] notification:send → userId: ${userId}`);

    try {
        // Persist to DB
        const Notification = (await import('../modules/notifications/notification.model.js')).default;
        const notification = await Notification.create({ user: userId, title, body, type, metadata });

        // Push in real-time if Socket.IO is up
        try {
            const { sendNotification } = await import('../sockets/notification.socket.js');
            const { getIo } = await import('../config/socket.js');
            sendNotification(getIo(), userId, notification);
        } catch {
            // Socket may not be available in worker/processor context
        }
    } catch (err) {
        logger.error(`[Event] notification:send failed: ${err.message}`);
    }
});

eventBus.on(NOTIFICATION_EVENTS.READ, ({ notificationId }) => {
    logger.debug(`[Event] notification:read — id: ${notificationId}`);
});

export const emitNotification = (payload) => eventBus.emit(NOTIFICATION_EVENTS.SEND, payload);
export const emitNotificationRead = (notificationId) => eventBus.emit(NOTIFICATION_EVENTS.READ, { notificationId });
