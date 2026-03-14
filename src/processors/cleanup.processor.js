import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Scheduled cleanup: remove expired tokens, old notifications, etc.
export const runCleanup = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
        // Example: delete old read notifications
        const Notification = mongoose.model('Notification');
        const result = await Notification.deleteMany({ isRead: true, createdAt: { $lt: thirtyDaysAgo } });
        logger.info(`Cleanup: removed ${result.deletedCount} old notifications`);
    } catch (error) {
        logger.error(`Cleanup processor error: ${error.message}`);
    }
};
