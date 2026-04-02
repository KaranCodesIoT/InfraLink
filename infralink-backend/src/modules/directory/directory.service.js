import User from '../users/user.model.js';
import BuilderProfile from '../builders/builderProfile.model.js';
import ContractorProfile from '../contractors/contractorProfile.model.js';
import WorkerProfile from '../workers/workerProfile.model.js';
import SupplierProfile from '../suppliers/supplierProfile.model.js';
import { buildPaginationMeta } from '../../utils/pagination.utils.js';
import { ALL_ROLES } from '../../constants/roles.js';

/**
 * Find professionals based on query parameters
 */
export const findProfessionals = async ({ role, page, limit, search, location, rating }) => {
    const filter = { 
        isActive: true,
        // Hide users who aren't construction professionals
        role: { $nin: ['unassigned', 'normal_user', 'client', 'admin'] },
    };

    const andConditions = [];

    // Filter by role if provided and valid
    if (role && ALL_ROLES.includes(role)) {
        filter.role = role;
    }

    // Basic search by name or skills
    if (search) {
        andConditions.push({
            $or: [
                { name: { $regex: search, $options: 'i' } }
            ]
        });
    }

    if (location) {
        andConditions.push({
            $or: [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.state': { $regex: location, $options: 'i' } },
                { 'location.address': { $regex: location, $options: 'i' } }
            ]
        });
    }

    if (rating) {
        const minRating = parseFloat(rating);
        const [builders, contractors, workers] = await Promise.all([
            BuilderProfile.find({ averageRating: { $gte: minRating } }).select('user').lean(),
            ContractorProfile.find({ averageRating: { $gte: minRating } }).select('user').lean(),
            WorkerProfile.find({ averageRating: { $gte: minRating } }).select('user').lean()
        ]);
        const ratedUserIds = [
            ...builders.map(p => p.user),
            ...contractors.map(p => p.user),
            ...workers.map(p => p.user)
        ];
        andConditions.push({ _id: { $in: ratedUserIds } });
    }

    if (andConditions.length > 0) {
        filter.$and = andConditions;
    }

    // Since rating is stored on the profiles, we'll fetch all matching users, 
    // populate their profiles, filter them in memory by rating, and then paginate.
    const allMatchingUsers = await User.find(filter)
        .select('-password -refreshToken -__v')
        .sort({ createdAt: -1 })
        .lean();

    let processedProfessionals = [];

    // Attach basic builder/contractor profile info for card display
    for (const prof of allMatchingUsers) {
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
            } else {
                prof.averageRating = 0;
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
            } else {
                prof.averageRating = 0;
            }
        } else if (prof.role === 'worker') {
            const wp = await WorkerProfile.findOne({ user: prof._id })
                .select('skills yearsOfExperience followersCount averageRating trade')
                .lean();
            if (wp) {
                prof.skills = wp.skills || [];
                prof.yearsOfExperience = wp.yearsOfExperience;
                prof.followersCount = wp.followersCount || 0;
                prof.averageRating = wp.averageRating || 0;
            } else {
                prof.averageRating = 0;
            }
        } else if (prof.role === 'supplier') {
            const sp = await SupplierProfile.findOne({ user: prof._id })
                .select('businessName categories verification reputation aiMetrics logistics')
                .lean();
            if (sp) {
                prof.companyName = sp.businessName;
                prof.skills = sp.categories || [];
                prof.yearsOfExperience = sp.verification?.yearsOfExperience || 0;
                // We use followersCount as a generic alias in the card, so let's use totalOrders for suppliers
                prof.followersCount = sp.reputation?.totalOrders || 0; 
                prof.averageRating = sp.reputation?.averageRating || 0;
                prof.aiMetrics = sp.aiMetrics; // Used for algorithm sorting
                prof.isVerified = sp.verification?.verifiedBadge || false;
                prof.logistics = sp.logistics; // For 'Fast Delivery' badge check
            } else {
                prof.averageRating = 0;
            }
        } else {
            prof.averageRating = 0;
        }
        
        // Apply rating filter
        if (rating) {
            if (prof.averageRating >= rating) {
                processedProfessionals.push(prof);
            }
        } else {
            processedProfessionals.push(prof);
        }
    }

    // AI Supplier Ranking Logic
    if (role === 'supplier') {
        processedProfessionals.sort((a, b) => {
            const scoreA = (a.averageRating * 10) + (a.aiMetrics?.deliverySuccessRate || 0) + (a.aiMetrics?.reliabilityScore || 0);
            const scoreB = (b.averageRating * 10) + (b.aiMetrics?.deliverySuccessRate || 0) + (b.aiMetrics?.reliabilityScore || 0);
            return scoreB - scoreA; // descending
        });
    }

    const total = processedProfessionals.length;
    const skip = (page - 1) * limit;
    const paginatedProfessionals = processedProfessionals.slice(skip, skip + limit);

    return {
        professionals: paginatedProfessionals,
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
    } else if (user.role === 'worker') {
        const workerProfile = await WorkerProfile.findOne({ user: id }).lean();
        if (workerProfile) {
            user.workerProfile = workerProfile;
            user.skills = workerProfile.skills || [];
            
            // Interaction stats
            user.followersCount = workerProfile.followersCount || 0;
            user.averageRating = workerProfile.averageRating || 0;
            user.totalReviews = workerProfile.totalReviews || 0;
            
            if (requesterUserId && workerProfile.followers) {
                user.isFollowing = workerProfile.followers.some(f => f.toString() === requesterUserId.toString());
            } else {
                user.isFollowing = false;
            }
        }
    } else if (user.role === 'supplier') {
        const supplierProfile = await SupplierProfile.findOne({ user: id }).lean();
        if (supplierProfile) {
            user.supplierProfile = supplierProfile;
            user.skills = supplierProfile.categories || [];
            user.companyName = supplierProfile.businessName;
            
            user.followersCount = supplierProfile.reputation?.totalOrders || 0;
            user.averageRating = supplierProfile.reputation?.averageRating || 0;
            user.totalReviews = supplierProfile.reputation?.repeatClients || 0;
            user.isVerified = supplierProfile.verification?.verifiedBadge || false;
            
            user.isFollowing = false;
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
