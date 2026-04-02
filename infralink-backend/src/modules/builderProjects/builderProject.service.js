import BuilderProject from './builderProject.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const createBuilderProject = async (builderId, data) => {
    const project = await BuilderProject.create({ ...data, builder: builderId });
    return project;
};

export const listBuilderProjects = async (query = {}) => {
    const { page, limit, skip, sort } = getPagination(query);

    const filter = {};
    if (query.city) filter.city = new RegExp(query.city, 'i');
    if (query.propertyType) filter.propertyType = query.propertyType;
    if (query.builder) filter.builder = query.builder;

    const [projects, total] = await Promise.all([
        BuilderProject.find(filter)
            .populate('builder', 'name avatar role rating isVerified')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        BuilderProject.countDocuments(filter),
    ]);

    return { projects, pagination: buildPaginationMeta(total, page, limit) };
};

export const getBuilderProject = async (id) => {
    const project = await BuilderProject.findById(id)
        .populate('builder', 'name avatar role rating isVerified reviews');
    if (!project) {
        const err = new Error('Builder project not found');
        err.statusCode = 404;
        throw err;
    }
    return project;
};

export const getMyBuilderProjects = async (builderId, query = {}) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { builder: builderId };

    const [projects, total] = await Promise.all([
        BuilderProject.find(filter).sort(sort).skip(skip).limit(limit),
        BuilderProject.countDocuments(filter),
    ]);

    return { projects, pagination: buildPaginationMeta(total, page, limit) };
};

export const updateBuilderProject = async (id, builderId, data) => {
    const project = await BuilderProject.findOneAndUpdate(
        { _id: id, builder: builderId },
        data,
        { new: true, runValidators: true }
    );
    if (!project) {
        const err = new Error('Builder project not found or unauthorized');
        err.statusCode = 404;
        throw err;
    }
    return project;
};

export const deleteBuilderProject = async (id, builderId) => {
    const project = await BuilderProject.findOneAndDelete({ _id: id, builder: builderId });
    if (!project) {
        const err = new Error('Builder project not found or unauthorized');
        err.statusCode = 404;
        throw err;
    }
    return project;
};

export const addUpdateToProject = async (id, builderId, data) => {
    const project = await BuilderProject.findOneAndUpdate(
        { _id: id, builder: builderId },
        { $push: { updates: data } },
        { new: true, runValidators: true }
    );
    if (!project) {
        const err = new Error('Builder project not found or unauthorized');
        err.statusCode = 404;
        throw err;
    }
    return project;
};

// ── Engagement helpers ────────────────────────────────────────────────

export const toggleLikeProject = async (projectId, userId) => {
    const project = await BuilderProject.findById(projectId);
    if (!project) {
        const err = new Error('Builder project not found');
        err.statusCode = 404;
        throw err;
    }
    const hasLiked = project.likes.some((id) => id.toString() === userId.toString());
    if (hasLiked) {
        project.likes.pull(userId);
    } else {
        project.likes.push(userId);
    }
    await project.save();
    return { liked: !hasLiked, likeCount: project.likes.length };
};

export const addCommentToProject = async (projectId, userId, text) => {
    const project = await BuilderProject.findById(projectId);
    if (!project) {
        const err = new Error('Builder project not found');
        err.statusCode = 404;
        throw err;
    }
    project.comments.push({ user: userId, text, createdAt: new Date() });
    await project.save();
    const updated = await BuilderProject.findById(projectId)
        .populate('comments.user', 'name avatar role');
    return updated.comments[updated.comments.length - 1];
};

export const getProjectComments = async (projectId) => {
    const project = await BuilderProject.findById(projectId)
        .populate('comments.user', 'name avatar role')
        .select('comments');
    if (!project) {
        const err = new Error('Builder project not found');
        err.statusCode = 404;
        throw err;
    }
    return project.comments;
};
