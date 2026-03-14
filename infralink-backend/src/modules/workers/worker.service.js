import WorkerProfile from './workerProfile.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const getOrCreateProfile = async (userId) => {
    let profile = await WorkerProfile.findOne({ user: userId }).populate('user', 'name email avatar');
    if (!profile) {
        profile = await WorkerProfile.create({ user: userId });
    }
    return profile;
};

export const updateProfile = async (userId, data) => {
    return WorkerProfile.findOneAndUpdate({ user: userId }, data, { new: true, upsert: true, runValidators: true });
};

export const listWorkers = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { isAvailable: true };
    if (query.skills) {
        const skills = query.skills.split(',').map((s) => s.trim());
        filter.skills = { $in: skills };
    }
    const [workers, total] = await Promise.all([
        WorkerProfile.find(filter).populate('user', 'name avatar').sort(sort).skip(skip).limit(limit),
        WorkerProfile.countDocuments(filter),
    ]);
    return { workers, pagination: buildPaginationMeta(total, page, limit) };
};
