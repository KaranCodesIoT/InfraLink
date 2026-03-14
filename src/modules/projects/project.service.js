import Project from './project.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const createProject = (clientId, data) => Project.create({ ...data, client: clientId });

export const listProjects = async (userId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { $or: [{ client: userId }, { workers: userId }] };
    const [projects, total] = await Promise.all([Project.find(filter).sort(sort).skip(skip).limit(limit), Project.countDocuments(filter)]);
    return { projects, pagination: buildPaginationMeta(total, page, limit) };
};

export const getProject = async (id) => {
    const p = await Project.findById(id).populate('client', 'name').populate('workers', 'name avatar');
    if (!p) { const e = new Error('Project not found'); e.statusCode = 404; throw e; }
    return p;
};

export const updateProject = (id, clientId, data) => Project.findOneAndUpdate({ _id: id, client: clientId }, data, { new: true });
