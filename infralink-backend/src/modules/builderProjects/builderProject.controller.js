import * as service from './builderProject.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const create = async (req, res, next) => {
    try {
        const project = await service.createBuilderProject(req.user._id, req.body);
        sendCreated(res, project);
    } catch (e) { next(e); }
};

export const list = async (req, res, next) => {
    try {
        const { projects, pagination } = await service.listBuilderProjects(req.query);
        sendPaginatedSuccess(res, projects, pagination);
    } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
    try {
        sendSuccess(res, await service.getBuilderProject(req.params.id));
    } catch (e) { next(e); }
};

export const getMine = async (req, res, next) => {
    try {
        const { projects, pagination } = await service.getMyBuilderProjects(req.user._id, req.query);
        sendPaginatedSuccess(res, projects, pagination);
    } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
    try {
        sendSuccess(res, await service.updateBuilderProject(req.params.id, req.user._id, req.body), 'Updated');
    } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
    try {
        await service.deleteBuilderProject(req.params.id, req.user._id);
        sendSuccess(res, null, 'Deleted');
    } catch (e) { next(e); }
};

export const addUpdate = async (req, res, next) => {
    try {
        const project = await service.addUpdateToProject(req.params.id, req.user._id, req.body);
        sendSuccess(res, project, 'Update added successfully');
    } catch (e) { next(e); }
};

export const likeProject = async (req, res, next) => {
    try {
        const result = await service.toggleLikeProject(req.params.id, req.user._id);
        sendSuccess(res, result, 'Like toggled');
    } catch (e) { next(e); }
};

export const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            const err = new Error('Comment text is required');
            err.statusCode = 400;
            throw err;
        }
        const comment = await service.addCommentToProject(req.params.id, req.user._id, text);
        sendSuccess(res, comment, 'Comment added');
    } catch (e) { next(e); }
};

export const getComments = async (req, res, next) => {
    try {
        const comments = await service.getProjectComments(req.params.id);
        sendSuccess(res, comments);
    } catch (e) { next(e); }
};
