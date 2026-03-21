import mongoose from 'mongoose';
import User from '../../users/user.model.js';
import Follow from '../models/follow.model.js';

/**
 * Switch a user's privacy mode
 */
export const togglePrivacyStatus = async (userId, targetStatus) => {
    // Current state check
    const user = await User.findById(userId).select('isPrivate');
    if (!user) throw new Error('User not found');

    const isCurrentlyPrivate = user.isPrivate;
    const isTargetingPrivate = targetStatus;

    if (isCurrentlyPrivate === isTargetingPrivate) {
        return { success: true, message: 'Privacy already matches target' };
    }

    // Toggle Public -> Private
    if (!isCurrentlyPrivate && isTargetingPrivate) {
        await User.findByIdAndUpdate(userId, { isPrivate: true });
        return { success: true, message: 'Account is now Private. Existing followers remain. New follows require approval.' };
    }

    // Toggle Private -> Public (Triggers mass-auto-accept loop)
    if (isCurrentlyPrivate && !isTargetingPrivate) {
        try {
            await User.findByIdAndUpdate(userId, { isPrivate: false });

            // Fetch all pending requests inbound to this user
            const pendingRequests = await Follow.find({ following: userId, status: 'pending' });
            
            if (pendingRequests.length > 0) {
                const requestIds = pendingRequests.map(req => req._id);
                const followerList = pendingRequests.map(req => req.follower);

                // Update follow records
                await Follow.updateMany(
                    { _id: { $in: requestIds } },
                    { $set: { status: 'accepted' } }
                );

                // Mass update all followers' following counts concurrently
                await User.updateMany(
                    { _id: { $in: followerList } },
                    { $inc: { followingCount: 1 } }
                );

                // Update the single target user's follower count
                await User.findByIdAndUpdate(
                    userId,
                    { $inc: { followersCount: pendingRequests.length } }
                );
            }

            return { 
                success: true, 
                message: `Account is now Public. ${pendingRequests.length} pending requests automatically accepted.` 
            };
        } catch (error) {
            throw error;
        }
    }
};
