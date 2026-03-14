import * as projectService from './project.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const createProject = async (req, res, next) => {
    try { sendCreated(res, await projectService.createProject(req.user._id, req.body)); }
    catch (e) { next(e); }
};
export const listProjects = async (req, res, next) => {
    try { const { projects, pagination } = await projectService.listProjects(req.user._id, req.query); sendPaginatedSuccess(res, projects, pagination); }
    catch (e) { next(e); }
};
export const getProject = async (req, res, next) => {
    try { sendSuccess(res, await projectService.getProject(req.params.id)); }
    catch (e) { next(e); }
};
export const updateProject = async (req, res, next) => {
    try { sendSuccess(res, await projectService.updateProject(req.params.id, req.user._id, req.body), 'Updated'); }
    catch (e) { next(e); }
};
