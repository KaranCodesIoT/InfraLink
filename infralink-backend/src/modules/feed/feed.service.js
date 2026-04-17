import mongoose from 'mongoose';
import Post from '../posts/post.model.js';
import Follow from '../network/models/follow.model.js';
import User from '../users/user.model.js';
import { cacheGet, cacheSet } from '../../cache/redisClient.js';

/**
 * Get a personalized feed for the user based on follows, connections, and role.
 */
export const getPersonalizedFeed = async (userId, userRole, page = 1, limit = 15) => {
    const cacheKey = `feed:${userId}:${page}:${limit}`;
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) return cachedData;

    const skip = (page - 1) * limit;
    const uId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch relations
    const [followingDocs, followersDocs] = await Promise.all([
        Follow.find({ follower: uId, status: 'accepted' }).select('following').lean(),
        Follow.find({ following: uId, status: 'accepted' }).select('follower').lean()
    ]);

    const followingIds = followingDocs.map(f => f.following);
    const followerIds = new Set(followersDocs.map(f => f.follower.toString()));
    
    // Mutuals are the intersection of following and followers
    const mutualIds = followingIds
        .filter(id => followerIds.has(id.toString()))
        .map(id => new mongoose.Types.ObjectId(id));

    const followingIdsCast = followingIds.map(id => new mongoose.Types.ObjectId(id));

    // 2. Aggregation Pipeline
    const posts = await Post.aggregate([
        {
            $match: {
                $or: [
                    { user: { $in: followingIdsCast } },
                    { role: userRole }, 
                    { user: uId }       
                ]
            }
        },
        {
            $addFields: {
                priorityScore: {
                    $add: [
                        {
                            $cond: {
                                if: { $in: ["$user", mutualIds] },
                                then: 15,
                                else: {
                                    $cond: {
                                        if: { $in: ["$user", followingIdsCast] },
                                        then: 10,
                                        else: {
                                            $cond: {
                                                if: { $eq: ["$role", userRole] },
                                                then: 3,
                                                else: 0
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        { $sort: { priorityScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'author'
            }
        },
        { 
            $unwind: {
                path: '$author',
                preserveNullAndEmptyArrays: true // Crucial: don't toss posts if lookup fails
            }
        },
        {
            $project: {
                'author.password': 0,
                'author.refreshToken': 0,
                'author.kycDocuments': 0
            }
        }
    ]);

    // 3. Fallback: If feed is empty or sparse, add recommended posts
    let finalPosts = posts;
    if (posts.length < 5 && page === 1) {
        const fetchedIds = posts.map(p => p._id);
        const recommendations = await Post.find({ 
            _id: { $nin: fetchedIds },
            user: { $ne: uId }
        })
        .sort({ createdAt: -1 })
        .limit(limit - posts.length)
        .populate('user', 'name profileImage avatar role')
        .lean();

        // Standardize author field for recommendations
        const mappedRecs = recommendations.map(r => ({
            ...r,
            author: r.user,
            isRecommended: true
        }));
        
        finalPosts = [...posts, ...mappedRecs];
    }

    const totalCount = await Post.countDocuments({
        $or: [
            { user: { $in: followingIdsCast } },
            { role: userRole },
            { user: uId }
        ]
    });

    const result = {
        posts: finalPosts,
        pagination: {
            total: totalCount,
            page,
            limit,
            hasMore: totalCount > skip + finalPosts.length
        }
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, result, 300);

    // Populate applications user for the final result
    await Post.populate(result.posts, {
        path: 'applications.user',
        select: 'name role profileImage avatar'
    });

    return result;
};

