import mongoose from 'mongoose';
import Block from '../models/block.model.js';
import Follow from '../models/follow.model.js';
import User from '../../users/user.model.js';
import { HTTP_STATUS } from '../../../constants/httpStatus.js';

/**
 * Block a user (one-way).
 * Executed in a transaction: destroys all Follows and Pending requests inherently.
 */
export const blockUser = async (blockerId, blockedId) => {
    if (blockerId.toString() === blockedId.toString()) {
        const err = new Error('Cannot block yourself');
        err.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw err;
    }

    try {
        // Create block record (atomic unique constraint ensures no duplicates)
        await Block.create([{ blocker: blockerId, blocked: blockedId }]);

        // Retrieve existing follows between these two users (both directions)
        const existingFollows = await Follow.find({
            $or: [
                { follower: blockerId, following: blockedId },
                { follower: blockedId, following: blockerId }
            ]
        });

        if (existingFollows.length > 0) {
            // Arrays to track counts that need updating
            let incrementA_follower = 0;
            let incrementA_following = 0;
            let incrementB_follower = 0;
            let incrementB_following = 0;

            const idsToDelete = [];

            for (const f of existingFollows) {
                idsToDelete.push(f._id);
                // Only modify counts if the follow record was fully 'accepted'
                if (f.status === 'accepted') {
                    if (f.follower.toString() === blockerId.toString()) { // A follows B
                        incrementA_following -= 1;
                        incrementB_follower -= 1;
                    } else { // B follows A
                        incrementB_following -= 1;
                        incrementA_follower -= 1;
                    }
                }
            }

            // Unfollow - delete specific follow records
            await Follow.deleteMany({ _id: { $in: idsToDelete } });

            // Update user counts
            if (incrementA_follower !== 0 || incrementA_following !== 0) {
                await User.findByIdAndUpdate(blockerId, {
                    $inc: { followersCount: incrementA_follower, followingCount: incrementA_following }
                });
            }
            if (incrementB_follower !== 0 || incrementB_following !== 0) {
                await User.findByIdAndUpdate(blockedId, {
                    $inc: { followersCount: incrementB_follower, followingCount: incrementB_following }
                });
            }
        }

        return { success: true };
    } catch (error) {
        if (error.code === 11000) return { success: true }; // Already blocked (idempotent)
        throw error;
    }
};

/**
 * Unblock a directly blocked user
 */
export const unblockUser = async (blockerId, blockedId) => {
    const result = await Block.findOneAndDelete({ blocker: blockerId, blocked: blockedId });
    if (!result) {
        const err = new Error('User is not blocked');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
    return { success: true };
};

/**
 * Check if there is an active block in either direction
 */
export const checkBlockExists = async (userA, userB) => {
    const block = await Block.findOne({
        $or: [
            { blocker: userA, blocked: userB },
            { blocker: userB, blocked: userA }
        ]
    }).lean();
    return !!block;
};

/**
 * Retrieve paginated list of blocked accounts
 */
export const getBlockedUsers = async (userId, limit = 20, cursor = null) => {
    const query = { blocker: userId };
    if (cursor) {
        query._id = { $lt: cursor };
    }

    const blocks = await Block.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .populate('blocked', 'name avatar role isPrivate')
        .lean();

    let hasNextPage = false;
    let nextCursor = null;

    if (blocks.length > limit) {
        hasNextPage = true;
        blocks.pop(); 
    }
    if (blocks.length > 0) {
        nextCursor = blocks[blocks.length - 1]._id;
    }

    return {
        data: blocks.map(b => b.blocked),
        meta: { hasNextPage, nextCursor }
    };
};
