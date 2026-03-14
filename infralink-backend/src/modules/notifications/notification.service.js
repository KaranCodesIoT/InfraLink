import Notification from './notification.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const getNotifications = async (userId, query) => {
    const { page, limit, skip } = getPagination(query);
    const [notifications, total] = await Promise.all([
        Notification.find({ user: userId }).sort('-createdAt').skip(skip).limit(limit),
        Notification.countDocuments({ user: userId }),
    ]);
    return { notifications, pagination: buildPaginationMeta(total, page, limit) };
};

export const markAsRead = async (id, userId) => {
    return Notification.findOneAndUpdate(
        { _id: id, user: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return Notification.updateMany({ user: userId, isRead: false }, { isRead: true, readAt: new Date() });
};
