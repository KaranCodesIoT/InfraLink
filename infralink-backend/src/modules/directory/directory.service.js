import User from '../users/user.model.js';
import BuilderProfile from '../builders/builderProfile.model.js';
import ContractorProfile from '../contractors/contractorProfile.model.js';
import { buildPaginationMeta } from '../../utils/pagination.utils.js';
import { ALL_ROLES } from '../../constants/roles.js';

/**
 * Find professionals based on query parameters
 */
export const findProfessionals = async ({ role, page, limit, search }) => {
    const filter = { 
        isActive: true,
        // Hide users who aren't construction professionals
        role: { $nin: ['unassigned', 'normal_user', 'client', 'admin'] },
    };

    // Filter by role if provided and valid
    if (role && ALL_ROLES.includes(role)) {
        filter.role = role;
    }

    // Basic search by name or skills
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            // If you add a 'skills' or 'specialization' field to the User model later, you can add it here
            // { skills: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const [professionals, total] = await Promise.all([
        User.find(filter)
            .select('-password -refreshToken -__v') // Exclude sensitive fields
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter)
    ]);

    // Attach basic builder/contractor profile info for card display
    for (const prof of professionals) {
        if (prof.role === 'builder') {
            const bp = await BuilderProfile.findOne({ user: prof._id })
                .select('companyName professionalDetails yearsOfExperience followersCount averageRating')
                .lean();
            if (bp) {
                prof.companyName = bp.companyName;
                prof.skills = bp.professionalDetails?.servicesOffered || [];
                prof.yearsOfExperience = bp.yearsOfExperience;
                prof.followersCount = bp.followersCount || 0;
                prof.averageRating = bp.averageRating || 0;
            }
        } else if (prof.role === 'contractor') {
            const cp = await ContractorProfile.findOne({ user: prof._id })
                .select('fullName professionalDetails experience followersCount averageRating')
                .lean();
            if (cp) {
                prof.fullName = cp.fullName;
                prof.skills = cp.professionalDetails?.services || [];
                prof.yearsOfExperience = cp.experience;
                prof.followersCount = cp.followersCount || 0;
                prof.averageRating = cp.averageRating || 0;
            }
        }
    }

    return {
        professionals,
        pagination: buildPaginationMeta(total, page, limit)
    };
};

/**
 * Get a single professional's public profile
 */
export const getProfessionalById = async (id, requesterUserId) => {
    const user = await User.findById(id)
        .select('-password -refreshToken -__v -email -phone')
        .lean();
        
    if (!user) return null;

    if (user.role === 'builder') {
        const builderProfile = await BuilderProfile.findOne({ user: id }).lean();
        if (builderProfile) {
            user.builderProfile = builderProfile;
            user.skills = builderProfile.professionalDetails?.servicesOffered || [];
            user.companyName = builderProfile.companyName;
            
            // Interaction stats
            user.followersCount = builderProfile.followersCount || 0;
            user.averageRating = builderProfile.averageRating || 0;
            user.totalReviews = builderProfile.totalReviews || 0;
            
            if (requesterUserId && builderProfile.followers) {
                user.isFollowing = builderProfile.followers.some(f => f.toString() === requesterUserId.toString());
            } else {
                user.isFollowing = false;
            }
        }
    } else if (user.role === 'contractor') {
        const contractorProfile = await ContractorProfile.findOne({ user: id }).lean();
        if (contractorProfile) {
            user.contractorProfile = contractorProfile;
            user.skills = contractorProfile.professionalDetails?.services || [];
            user.fullName = contractorProfile.fullName;
            
            // Interaction stats
            user.followersCount = contractorProfile.followersCount || 0;
            user.averageRating = contractorProfile.averageRating || 0;
            user.totalReviews = contractorProfile.totalReviews || 0;
            
            if (requesterUserId && contractorProfile.followers) {
                user.isFollowing = contractorProfile.followers.some(f => f.toString() === requesterUserId.toString());
            } else {
                user.isFollowing = false;
            }
        }
    }

    return user;
};

/**
 * Get count of users per role (for dashboard summary)
 */
export const getCountsByRole = async () => {
    const counts = await User.aggregate([
        { $match: { isActive: true, role: { $nin: ['unassigned', 'normal_user', 'client', 'admin'] } } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Map to a more usable object { role: count }
    return counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});
};
