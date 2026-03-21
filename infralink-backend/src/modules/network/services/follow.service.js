import mongoose from 'mongoose';
import Follow from '../models/follow.model.js';
import User from '../../users/user.model.js';
import { checkBlockExists } from './block.service.js';
import { HTTP_STATUS } from '../../../constants/httpStatus.js';

const ALLOWED_TARGETS = {
  'labour': ['builder', 'contractor', 'developer', 'architect', 'supplier', 'labour'],
  'contractor': ['builder', 'developer', 'architect', 'supplier', 'labour', 'contractor'],
  'architect': ['builder', 'developer', 'contractor', 'labour', 'architect'],
  'supplier': ['builder', 'contractor', 'developer', 'labour', 'supplier'],
  'inspector': ['builder', 'architect', 'developer', 'labour', 'inspector'],
  'client': ['builder', 'architect', 'contractor', 'developer', 'labour', 'client'],
  'builder': ['*'],
  'developer': ['*'],
  'admin': ['*']
};

const _validateRoleConstraint = (followerRole, targetRole) => {
    const follower = followerRole.toLowerCase();
    const target = targetRole.toLowerCase();
    
    if (follower === 'admin' || follower === 'developer' || follower === 'builder') return true;
    
    const allowed = ALLOWED_TARGETS[follower];
    if (!allowed) return false;
    
    if (allowed.includes('*') || allowed.includes(target)) return true;
    return false;
};

/**
 * Handle public follows and private requests
 */
export const followUser = async (followerId, followerRole, targetId) => {
    if (followerId.toString() === targetId.toString()) {
        const err = new Error('You cannot follow yourself');
        err.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw err;
    }

    const isBlocked = await checkBlockExists(followerId, targetId);
    if (isBlocked) {
        const err = new Error('Account unavailable');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }

    const targetUser = await User.findById(targetId).select('role isPrivate').lean();
    if (!targetUser) {
        const err = new Error('Target user not found');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }

    const isAllowed = _validateRoleConstraint(followerRole, targetUser.role);
    if (!isAllowed) {
        const err = new Error(`Role Restriction: ${followerRole} accounts cannot follow ${targetUser.role} accounts.`);
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }

    const existingFollow = await Follow.findOne({ follower: followerId, following: targetId });
    if (existingFollow) {
        if (existingFollow.status === 'pending') {
            const err = new Error('Follow request already sent');
            err.statusCode = HTTP_STATUS.CONFLICT;
            throw err;
        }
        if (existingFollow.status === 'accepted') {
            const err = new Error('Already following this user');
            err.statusCode = HTTP_STATUS.CONFLICT;
            throw err;
        }
        // If rejected, allow re-requesting
        if (existingFollow.status === 'rejected') {
            existingFollow.status = targetUser.isPrivate ? 'pending' : 'accepted';
            await existingFollow.save();
            
            if (existingFollow.status === 'accepted') {
                await _atomicUpdateCounts(followerId, targetId, 1);
            }
            return existingFollow;
        }
    }

    // New Follow Creation
    const status = targetUser.isPrivate ? 'pending' : 'accepted';
    
    if (status === 'accepted') {
        try {
            const follow = await Follow.create({ follower: followerId, following: targetId, status });
            await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
            await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });
            return follow;
        } catch (error) {
            throw error;
        }
    } else {
        // Pending request (no count update)
        return await Follow.create({ follower: followerId, following: targetId, status: 'pending' });
    }
};

/**
 * Handle withdrawing a sent request
 */
export const withdrawFollowRequest = async (followerId, targetId) => {
    const follow = await Follow.findOneAndDelete({ follower: followerId, following: targetId, status: 'pending' });
    if (!follow) {
        const err = new Error('Request not found or already accepted');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
    return { success: true };
};

/**
 * Handle unfollowing an accepted relationship
 */
export const unfollowUser = async (followerId, targetId) => {
    try {
        const follow = await Follow.findOneAndDelete({ follower: followerId, following: targetId, status: 'accepted' });
        if (!follow) {
            const err = new Error('You are not following this user');
            err.statusCode = HTTP_STATUS.BAD_REQUEST;
            throw err;
        }
        
        // Decrament
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
        
        return { success: true };
    } catch (error) {
        throw error;
    }
};

/**
 * Private targets accepting incoming requests
 */
export const acceptFollowRequest = async (targetId, followerId) => {
    try {
        const follow = await Follow.findOne({ follower: followerId, following: targetId, status: 'pending' });
        if (!follow) {
            const err = new Error('Pending request not found');
            err.statusCode = HTTP_STATUS.NOT_FOUND;
            throw err;
        }

        follow.status = 'accepted';
        await follow.save();
        
        // Increment
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });

        return follow;
    } catch (error) {
        throw error;
    }
};

/**
 * Target rejecting an incoming request
 */
export const rejectFollowRequest = async (targetId, followerId) => {
    const follow = await Follow.findOneAndUpdate(
        { follower: followerId, following: targetId, status: 'pending' },
        { status: 'rejected' },
        { new: true }
    );
    if (!follow) {
        const err = new Error('Pending request not found');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
    return follow;
};

/**
 * Privately bulk accept all incoming pending requests
 */
export const bulkAcceptRequests = async (targetId) => {
    try {
        const pendingRequests = await Follow.find({ following: targetId, status: 'pending' });
        if (pendingRequests.length === 0) {
            return { success: true, count: 0 };
        }

        const requestIds = pendingRequests.map(req => req._id);
        const followerList = pendingRequests.map(req => req.follower);

        await Follow.updateMany(
            { _id: { $in: requestIds } },
            { $set: { status: 'accepted' } }
        );

        // Update counts atomic
        await User.updateMany(
            { _id: { $in: followerList } },
            { $inc: { followingCount: 1 } }
        );

        await User.findByIdAndUpdate(targetId, { $inc: { followersCount: pendingRequests.length } });

        return { success: true, count: pendingRequests.length };
    } catch (error) {
        throw error;
    }
};

/**
 * Privately bulk reject all incoming pending requests
 */
export const bulkRejectRequests = async (targetId) => {
    const result = await Follow.updateMany(
        { following: targetId, status: 'pending' },
        { $set: { status: 'rejected' } }
    );
    return { success: true, count: result.modifiedCount };
};

/**
 * Privately remove a follower natively without blocking
 */
export const removeFollower = async (targetId, followerId) => {
    try {
        const follow = await Follow.findOneAndDelete({ follower: followerId, following: targetId, status: 'accepted' });
        if (!follow) {
            const err = new Error('User is not following you');
            err.statusCode = HTTP_STATUS.NOT_FOUND;
            throw err;
        }
        
        // Decrement
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });

        return { success: true };
    } catch (error) {
        throw error;
    }
};

/**
 * Reusable helper: Check if two users mutually follow each other.
 * Uses a single query with $or to check both directions in one DB round-trip.
 * Returns true only if BOTH directions have status === 'accepted'.
 */
export const isMutualFollow = async (userA, userB) => {
    const count = await Follow.countDocuments({
        $or: [
            { follower: userA, following: userB, status: 'accepted' },
            { follower: userB, following: userA, status: 'accepted' }
        ]
    });
    return count === 2; // Both directions must exist
};

/**
 * Check follow status between user and target — optimized single query.
 * Instagram-strict: returns 'blocked' immediately if block exists.
 */
export const checkFollowStatus = async (currentUserId, currentUserRole, targetId) => {
    // STRICT: Block check first — blocked = invisible
    const isBlocked = await checkBlockExists(currentUserId, targetId);
    if (isBlocked) {
        return {
            status: 'blocked',
            is_following_back: false,
            is_mutual: false,
            is_allowed: false,
            restriction_reason: 'User not found or account unavailable'
        };
    }

    const target = await User.findById(targetId).select('role isPrivate').lean();
    if (!target) return { status: 'not_following', is_allowed: false };

    const isAllowed = _validateRoleConstraint(currentUserRole, target.role);
    const restrictionReason = isAllowed ? null : `Role Restriction: ${currentUserRole} accounts cannot follow ${target.role} accounts.`;

    // Single query to fetch both follow directions at once
    const follows = await Follow.find({
        $or: [
            { follower: currentUserId, following: targetId },
            { follower: targetId, following: currentUserId }
        ]
    }).lean();

    const outgoing = follows.find(f => f.follower.toString() === currentUserId.toString());
    const incoming = follows.find(f => f.follower.toString() === targetId.toString());

    const status = outgoing ? (outgoing.status === 'rejected' ? 'not_following' : outgoing.status) : 'not_following';
    const isFollowingBack = incoming?.status === 'accepted';
    const isMutual = status === 'accepted' && isFollowingBack;

    return {
        status,
        is_following_back: isFollowingBack,
        is_mutual: isMutual,
        is_allowed: isAllowed,
        is_private: target.isPrivate || false,
        restriction_reason: restrictionReason
    };
};

/**
 * Get users following a user.
 * Instagram-strict: If viewing ANOTHER user's list, enforce block + privacy checks.
 * @param {string} userId - The user whose followers to fetch
 * @param {number} limit
 * @param {string|null} cursor
 * @param {string|null} requesterId - The authenticated user requesting the data (null = self)
 */
export const getFollowers = async (userId, limit = 20, cursor = null, requesterId = null) => {
    // STRICT: If viewing another user's followers
    if (requesterId && requesterId.toString() !== userId.toString()) {
        // Block check: blocked users see nothing
        const isBlocked = await checkBlockExists(requesterId, userId);
        if (isBlocked) return { items: [], nextCursor: null, hasNextPage: false };

        // Privacy check: private account + not following = hidden
        const targetUser = await User.findById(userId).select('isPrivate').lean();
        if (targetUser?.isPrivate) {
            const isFollowing = await Follow.findOne({ follower: requesterId, following: userId, status: 'accepted' }).lean();
            if (!isFollowing) return { items: [], nextCursor: null, hasNextPage: false };
        }
    }

    const query = { following: userId, status: 'accepted' };
    if (cursor) query._id = { $lt: cursor };
    
    const followers = await Follow.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .populate('follower', 'name email avatar role')
        .lean();
        
    const hasNextPage = followers.length > limit;
    const items = hasNextPage ? followers.slice(0, -1) : followers;
    const nextCursor = items.length > 0 ? items[items.length - 1]._id : null;
    
    return { items, nextCursor, hasNextPage };
};

/**
 * Get users the user is following.
 * Instagram-strict: If viewing ANOTHER user's list, enforce block + privacy checks.
 */
export const getFollowing = async (userId, limit = 20, cursor = null, requesterId = null) => {
    // STRICT: If viewing another user's following list
    if (requesterId && requesterId.toString() !== userId.toString()) {
        const isBlocked = await checkBlockExists(requesterId, userId);
        if (isBlocked) return { items: [], nextCursor: null, hasNextPage: false };

        const targetUser = await User.findById(userId).select('isPrivate').lean();
        if (targetUser?.isPrivate) {
            const isFollowing = await Follow.findOne({ follower: requesterId, following: userId, status: 'accepted' }).lean();
            if (!isFollowing) return { items: [], nextCursor: null, hasNextPage: false };
        }
    }

    const query = { follower: userId, status: 'accepted' };
    if (cursor) query._id = { $lt: cursor };
    
    const following = await Follow.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .populate('following', 'name email avatar role')
        .lean();
        
    const hasNextPage = following.length > limit;
    const items = hasNextPage ? following.slice(0, -1) : following;
    const nextCursor = items.length > 0 ? items[items.length - 1]._id : null;
    
    return { items, nextCursor, hasNextPage };
};

/**
 * Get incoming follow requests
 */
export const getIncomingRequests = async (userId, limit = 20, cursor = null) => {
    const query = { following: userId, status: 'pending' };
    if (cursor) query._id = { $lt: cursor };
    
    const requests = await Follow.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .populate('follower', 'name email avatar role')
        .lean();
        
    const hasNextPage = requests.length > limit;
    const items = hasNextPage ? requests.slice(0, -1) : requests;
    const nextCursor = items.length > 0 ? items[items.length - 1]._id : null;
    
    return { items, nextCursor, hasNextPage };
};

/**
 * Get outgoing follow requests
 */
export const getOutgoingRequests = async (userId, limit = 20, cursor = null) => {
    const query = { follower: userId, status: 'pending' };
    if (cursor) query._id = { $lt: cursor };
    
    const requests = await Follow.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .populate('following', 'name email avatar role')
        .lean();
        
    const hasNextPage = requests.length > limit;
    const items = hasNextPage ? requests.slice(0, -1) : requests;
    const nextCursor = items.length > 0 ? items[items.length - 1]._id : null;
    
    return { items, nextCursor, hasNextPage };
};

/**
 * Helper to update counts
 */
const _atomicUpdateCounts = async (followerId, followingId, directionNum) => {
    try {
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: directionNum } });
        await User.findByIdAndUpdate(followingId, { $inc: { followersCount: directionNum } });
    } catch (error) {
        console.error('Failed Count Update:', error);
    }
};
