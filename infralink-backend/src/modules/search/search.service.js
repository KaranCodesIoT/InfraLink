import Job from '../jobs/job.model.js';
import WorkerProfile from '../workers/workerProfile.model.js';
import Material from '../marketplace/material.model.js';
import Equipment from '../equipment/equipment.model.js';
import Block from '../network/models/block.model.js';
import User from '../users/user.model.js';
import { withCache } from '../../cache/cache.service.js';

const SEARCH_TTL = 60; // 1 minute

export const semanticSearchProfessionals = async (query, filters = {}) => {
    const { role, location, limit = 5 } = filters;
    const dbQuery = {};
    if (role) dbQuery.role = role.toLowerCase();
    if (location) {
        dbQuery.$or = [
            { 'location.city': new RegExp(location, 'i') },
            { 'location.address': new RegExp(location, 'i') }
        ];
    }
    if (query && !role) {
        dbQuery.$or = [
            ...dbQuery.$or || [],
            { skills: new RegExp(query, 'i') },
            { bio: new RegExp(query, 'i') }
        ];
    }
    
    const professionals = await User.find(dbQuery).limit(limit).lean();
    return professionals.map(p => ({
        _id: p._id,
        name: p.name,
        role: p.role,
        location: p.location?.city || p.location?.address || 'Unknown',
        rating: 4.5, // Mock rating if not available
        matchScore: 0.9,
        avatar: p.avatar,
        isVerified: p.isVerified
    }));
};

export const globalSearch = async (q, type, currentUserId = null) => {
    if (!q) return {};

    const cacheKey = `search:${type || 'all'}:${q.toLowerCase().trim()}`;

    return withCache(cacheKey, async () => {
        const regexQ = new RegExp(q, 'i');
        const results = {};

        // Find blocked users to filter out
        let blockedUserIds = [];
        if (currentUserId) {
            const blocks = await Block.find({
                $or: [{ blocker: currentUserId }, { blocked: currentUserId }]
            }).lean();
            blockedUserIds = blocks.map(b => 
                b.blocker.toString() === currentUserId.toString() ? b.blocked : b.blocker
            );
        }

        if (!type || type === 'jobs') {
            results.jobs = await Job.find({ 
                $or: [{ title: regexQ }, { description: regexQ }], 
                status: 'open',
                client: { $nin: blockedUserIds }
            })
                .limit(10).select('title status createdAt');
        }
        if (!type || type === 'workers') {
            results.workers = await WorkerProfile.find({ 
                skills: regexQ, 
                isAvailable: true,
                user: { $nin: blockedUserIds } 
            })
                .populate('user', 'name avatar').limit(10);
        }
        if (!type || type === 'materials') {
            results.materials = await Material.find({ name: regexQ, isAvailable: true })
                .limit(10).select('name price unit');
        }
        if (!type || type === 'equipment') {
            results.equipment = await Equipment.find({ name: regexQ, isAvailable: true })
                .limit(10).select('name dailyRate');
        }

        return results;
    }, SEARCH_TTL);
};
