import { notificationQueue } from '../queues/notification.queue.js';
import { sendNotification } from '../sockets/notification.socket.js';
import { getIo } from '../config/socket.js';
import Notification from '../modules/notifications/notification.model.js';
import logger from '../utils/logger.js';

notificationQueue.process(async (job) => {
    const { userId, title, body, type, metadata } = job.data;
    logger.info(`Processing notification for user: ${userId}`);

    try {
        const notification = await Notification.create({ user: userId, title, body, type, metadata });
        // Push via Socket.IO if user is online
        try {
            sendNotification(getIo(), userId, notification);
        } catch (_) {
            // Socket.IO may not be initialised in worker context — ignore
        }
    } catch (error) {
        logger.error(`Notification processor error: ${error.message}`);
        throw error;
    }
});
