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

export const addPortfolioProject = async (userId, projectData) => {
    let profile = await WorkerProfile.findOne({ user: userId });
    if (!profile) profile = await WorkerProfile.create({ user: userId });

    if (!profile.portfolio) profile.portfolio = [];

    if (projectData.legalDeclaration) {
        projectData.legalDeclaration.declaredAt = new Date();
    }

    const project = {
        ...projectData,
        verificationStatus: 'self_declared',
    };

    profile.portfolio.push(project);
    await profile.save();

    return profile.portfolio[profile.portfolio.length - 1];
};

export const removePortfolioProject = async (userId, projectId) => {
    const profile = await WorkerProfile.findOne({ user: userId });
    if (!profile || !profile.portfolio) throw Object.assign(new Error('Worker profile not found'), { statusCode: 404 });

    const projectIndex = profile.portfolio.findIndex(p => p._id.toString() === projectId);
    if (projectIndex === -1) throw Object.assign(new Error('Project not found'), { statusCode: 404 });

    profile.portfolio.splice(projectIndex, 1);
    await profile.save();

    return { message: 'Project removed successfully' };
};
