import * as notificationService from './notification.service.js';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const getNotifications = async (req, res, next) => {
    try {
        const { notifications, pagination } = await notificationService.getNotifications(req.user._id, req.query);
        sendPaginatedSuccess(res, notifications, pagination);
    } catch (e) { next(e); }
};

export const markAsRead = async (req, res, next) => {
    try { sendSuccess(res, await notificationService.markAsRead(req.params.id, req.user._id)); }
    catch (e) { next(e); }
};

export const markAllAsRead = async (req, res, next) => {
    try { await notificationService.markAllAsRead(req.user._id); sendSuccess(res, null, 'All notifications marked as read'); }
    catch (e) { next(e); }
};
