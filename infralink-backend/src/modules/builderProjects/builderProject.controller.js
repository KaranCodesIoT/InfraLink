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

export const getTeams = async (req, res, next) => {
    try {
        sendSuccess(res, await service.getProjectTeams(req.params.id));
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
        const { reason } = req.body;
        await service.deleteBuilderProject(req.params.id, req.user._id, reason);
        sendSuccess(res, null, 'Deleted');
    } catch (e) { next(e); }
};

export const addUpdate = async (req, res, next) => {
    try {
        const project = await service.addUpdateToProject(req.params.id, req.user._id, req.body);
        sendSuccess(res, project, 'Update added successfully');
    } catch (e) { next(e); }
};

export const applyToProject = async (req, res, next) => {
    try {
        const application = await service.applyToBuilderProject(req.params.id, req.user._id, req.user.role);
        sendSuccess(res, application, 'Application submitted successfully');
    } catch (e) { next(e); }
};

export const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
            const err = new Error('Invalid status');
            err.statusCode = 400;
            throw err;
        }
        const updatedApp = await service.updateApplicationStatus(req.params.id, req.user._id, req.params.applicationId, status);
        sendSuccess(res, updatedApp, `Application ${status}`);
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

// ── Dynamic Dashboard Controller Methods ─────────────────────────────────

export const assignContractor = async (req, res, next) => {
    try {
        const { phaseId, taskId, contractorId } = req.body;
        const workflow = await service.assignContractorToTask(req.params.id, req.user._id, phaseId, taskId, contractorId);
        sendSuccess(res, workflow, 'Contractor assigned successfully');
    } catch (e) { next(e); }
};

export const postLabourReq = async (req, res, next) => {
    try {
        const reqData = await service.postLabourRequirement(req.params.id, req.user._id, req.body);
        sendSuccess(res, reqData, 'Labour requirement posted');
    } catch (e) { next(e); }
};

export const applyForLabour = async (req, res, next) => {
    try {
        const reqItem = await service.applyForLabourRequirement(req.params.id, req.params.requirementId, req.user._id);
        sendSuccess(res, reqItem, 'Application submitted');
    } catch (e) { next(e); }
};

export const updateApplicantStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const reqItem = await service.updateLabourApplicantStatus(req.params.id, req.params.requirementId, req.params.applicantId, status);
        sendSuccess(res, reqItem, 'Applicant status updated');
    } catch (e) { next(e); }
};

export const submitDailyLog = async (req, res, next) => {
    try {
        const log = await service.submitDailyUpdate(req.params.id, req.user._id, req.body.contractorId, req.body);
        sendSuccess(res, log, 'Daily log submitted');
    } catch (e) { next(e); }
};

export const verifyLog = async (req, res, next) => {
    try {
        const log = await service.verifyDailyUpdate(req.params.id, req.params.updateId, req.user._id);
        sendSuccess(res, log, 'Log verified');
    } catch (e) { next(e); }
};

export const addProjectIssue = async (req, res, next) => {
    try {
        const issue = await service.addIssue(req.params.id, req.user._id, req.body);
        sendSuccess(res, issue, 'Issue reported');
    } catch (e) { next(e); }
};

export const updateProjectIssueStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const issue = await service.updateIssueStatus(req.params.id, req.params.issueId, status);
        sendSuccess(res, issue, 'Issue status updated');
    } catch (e) { next(e); }
};

export const getProjectDashboardData = async (req, res, next) => {
    try {
        const data = await service.getProjectDashboardStats(req.params.id);
        sendSuccess(res, data);
    } catch (e) { next(e); }
};

