import User from '../users/user.model.js';
import { buildPaginationMeta } from '../../utils/pagination.utils.js';
import { ALL_ROLES } from '../../constants/roles.js';

/**
 * Find professionals based on query parameters
 */
export const findProfessionals = async ({ role, page, limit, search }) => {
    const filter = { 
        isActive: true,
        // Assuming we only want to show verified/active professionals in the directory
        // isVerified: true 
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

    return {
        professionals,
        pagination: buildPaginationMeta(total, page, limit)
    };
};

/**
 * Get a single professional's public profile
 */
export const getProfessionalById = async (id) => {
    return User.findById(id)
        .select('-password -refreshToken -__v -email -phone') // Extensively hide personal contact info unless authorized/purchased
        .lean();
};

/**
 * Get count of users per role (for dashboard summary)
 */
export const getCountsByRole = async () => {
    const counts = await User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Map to a more usable object { role: count }
    return counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});
};

