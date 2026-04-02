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
    
    if (query.search) {
        filter.projectName = new RegExp(query.search, 'i');
    }

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

export const deleteBuilderProject = async (id, builderId, reason) => {
    const project = await BuilderProject.findOne({ _id: id, builder: builderId });
    if (!project) {
        const err = new Error('Builder project not found or unauthorized');
        err.statusCode = 404;
        throw err;
    }

    if (project.projectStatus === 'Completed' || project.projectStatus === 'Ready to Move') {
        const err = new Error('Cannot delete a completed project');
        err.statusCode = 400;
        throw err;
    }

    if (!reason) {
        const err = new Error('Deletion reason is required');
        err.statusCode = 400;
        throw err;
    }

    // Log the deletion reason for administrative review (optional)
    console.log(`[Project Deletion] Project ${id} deleted by Builder ${builderId}. Reason: ${reason}`);

    await BuilderProject.findByIdAndDelete(id);
    return project;
};
