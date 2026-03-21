import * as followService from './services/follow.service.js';
import * as blockService from './services/block.service.js';
import * as privacyService from './services/privacy.service.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { emitNotification } from '../../events/notification.events.js';

// ---- FOLLOW & UNFOLLOW ---- 

export const followUser = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const result = await followService.followUser(req.user.id, req.user.role, targetId);
        // Notify the target user
        emitNotification({
            userId: targetId,
            title: 'New Follower',
            body: `${req.user.name || 'Someone'} started following you`,
            type: 'follow',
            metadata: { followerId: req.user.id }
        });
        res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const unfollowUser = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        await followService.unfollowUser(req.user.id, targetId);
        // Notify the target user
        emitNotification({
            userId: targetId,
            title: 'Unfollowed',
            body: `${req.user.name || 'Someone'} unfollowed you`,
            type: 'unfollow',
            metadata: { followerId: req.user.id }
        });
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) { next(error); }
};

export const withdrawRequest = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        await followService.withdrawFollowRequest(req.user.id, targetId);
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Request withdrawn' });
    } catch (error) { next(error); }
};

// ---- ACCEPT & REJECT ---- 

export const acceptRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params; // Using followerId for now as param semantic
        const result = await followService.acceptFollowRequest(req.user.id, requestId);
        res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const rejectRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const result = await followService.rejectFollowRequest(req.user.id, requestId);
        res.status(HTTP_STATUS.OK).json({ success: true, data: result });
    } catch (error) { next(error); }
};

export const removeFollower = async (req, res, next) => {
    try {
        const { followerId } = req.params;
        await followService.removeFollower(req.user.id, followerId);
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'Follower removed silently' });
    } catch (error) { next(error); }
};

// ---- BLOCKING ----

export const blockUser = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        await blockService.blockUser(req.user.id, targetId);
        // Notify the target user
        emitNotification({
            userId: targetId,
            title: 'Account Update',
            body: 'Your connection with a user has changed',
            type: 'block',
            metadata: { blockerId: req.user.id }
        });
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'User blocked' });
    } catch (error) { next(error); }
};

export const unblockUser = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        await blockService.unblockUser(req.user.id, targetId);
        res.status(HTTP_STATUS.OK).json({ success: true, message: 'User unblocked' });
    } catch (error) { next(error); }
};

export const getBlockedList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor || null;
        const list = await blockService.getBlockedUsers(req.user.id, limit, cursor);
        res.status(HTTP_STATUS.OK).json({ success: true, ...list });
    } catch (error) { next(error); }
};

// ---- PRIVACY ----

export const togglePrivacy = async (req, res, next) => {
    try {
        const { isPrivate } = req.body;
        const result = await privacyService.togglePrivacyStatus(req.user.id, isPrivate);
        res.status(HTTP_STATUS.OK).json(result);
    } catch (error) { next(error); }
};

// ---- STATUS FETCH ---- 

export const fetchStatus = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const payload = await followService.checkFollowStatus(req.user.id, req.user.role, targetId);
        res.status(HTTP_STATUS.OK).json({ success: true, data: payload });
    } catch (error) { next(error); }
};

// ---- LISTS FETCH ----

export const getFollowersList = async (req, res, next) => {
    try {
        const targetId = req.params.targetId || req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor || null;
        const list = await followService.getFollowers(targetId, limit, cursor, req.user.id);
        res.status(HTTP_STATUS.OK).json({ success: true, ...list });
    } catch (error) { next(error); }
};

export const getFollowingList = async (req, res, next) => {
    try {
        const targetId = req.params.targetId || req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor || null;
        const list = await followService.getFollowing(targetId, limit, cursor, req.user.id);
        res.status(HTTP_STATUS.OK).json({ success: true, ...list });
    } catch (error) { next(error); }
};

export const getIncomingRequestsList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor || null;
        const list = await followService.getIncomingRequests(req.user.id, limit, cursor);
        res.status(HTTP_STATUS.OK).json({ success: true, ...list });
    } catch (error) { next(error); }
};

export const getOutgoingRequestsList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor || null;
        const list = await followService.getOutgoingRequests(req.user.id, limit, cursor);
        res.status(HTTP_STATUS.OK).json({ success: true, ...list });
    } catch (error) { next(error); }
};

// ---- BULK REQUEST MANAGEMENT ----

export const bulkAcceptAll = async (req, res, next) => {
    try {
        const result = await followService.bulkAcceptRequests(req.user.id);
        res.status(HTTP_STATUS.OK).json({ success: true, message: `Accepted ${result.count} requests` });
    } catch (error) { next(error); }
};

export const bulkRejectAll = async (req, res, next) => {
    try {
        const result = await followService.bulkRejectRequests(req.user.id);
        res.status(HTTP_STATUS.OK).json({ success: true, message: `Rejected ${result.count} requests` });
    } catch (error) { next(error); }
};

// ---- BLOCK STATUS ----

export const getBlockStatus = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const isBlockedContext = await blockService.checkBlockExists(req.user.id, targetId);
        res.status(HTTP_STATUS.OK).json({ success: true, isBlocked: isBlockedContext });
    } catch (error) { next(error); }
};

