import BuilderProject from './builderProject.model.js';
import User from '../users/user.model.js';
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

// ── Teams Module helpers ────────────────────────────────────────────────

export const applyToBuilderProject = async (projectId, userId, role) => {
    const project = await BuilderProject.findById(projectId);
    if (!project) {
        const err = new Error('Builder project not found');
        err.statusCode = 404;
        throw err;
    }
    
    const alreadyApplied = project.applications.some(app => app.user.toString() === userId.toString());
    if (alreadyApplied) {
        const err = new Error('You have already applied to this project');
        err.statusCode = 400;
        throw err;
    }

    project.applications.push({ user: userId, role, status: 'pending', appliedAt: new Date() });
    await project.save();
    
    return project.applications[project.applications.length - 1];
};

export const updateApplicationStatus = async (projectId, builderId, applicationId, status) => {
    console.log(`[StatusUpdate] Project: ${projectId}, Builder: ${builderId}, App: ${applicationId}, Status: ${status}`);
    
    // Using atomic update with positional operator for reliability
    const project = await BuilderProject.findOneAndUpdate(
        { 
            _id: projectId, 
            builder: builderId, 
            'applications._id': applicationId 
        },
        { 
            $set: { 'applications.$.status': status } 
        },
        { new: true, runValidators: true }
    ).populate('applications.user', 'name role');

    if (!project) {
        console.error('[StatusUpdate] Project or Application not found or unauthorized');
        const err = new Error('Project or Application not found or unauthorized');
        err.statusCode = 404;
        throw err;
    }

    const application = project.applications.id(applicationId);
    console.log('[StatusUpdate] Successfully updated and saved');
    return application;
};

export const getProjectTeams = async (projectId) => {
    // Determine if the project exists and populate applications
    const project = await BuilderProject.findById(projectId).populate(
        'applications.user',
        'name avatar role contractorType professionType skills averageRating followersCount location _id email phone'
    );

    if (!project) {
        const err = new Error('Builder project not found');
        err.statusCode = 404;
        throw err;
    }

    // Process real applications from DB
    const contractors = [];
    const architects = [];
    const labourRequests = [];

    (project.applications || []).forEach(app => {
        const u = app.user;
        if (!u) return;

        const applicationData = {
            id: u._id.toString(), // The User's ID for routing
            applicationId: app._id.toString(), // The Application ID for accepting/rejecting
            name: u.name,
            avatar: u.avatar || null,
            email: u.email,
            phone: u.phone,
            role: app.role,
            status: app.status, // "pending", "accepted", "rejected"
            appliedAt: app.appliedAt,
            rating: u.averageRating || 'Unrated',
            location: u.location?.city || 'Not specified',
        };

        if (app.role === 'contractor') {
            contractors.push({
                ...applicationData,
                type: u.contractorType || 'General Contractor',
                projectsCompleted: Math.floor(Math.random() * 50) + 1, // Mock
                progress: 0,
                assignedTasks: [],
                workersCount: 0,
                delayed: false
            });
        } else if (app.role === 'architect') {
            architects.push({
                ...applicationData,
                firm: 'Independent',
                approvalStatus: 'approved',
                drawingsV: 'v1.0',
                drawingsSubmitted: 0,
                approved: 0
            });
        } else if (app.role === 'worker' || app.role === 'labour') {
            labourRequests.push({
                ...applicationData,
                trade: u.skills?.[0] || 'Unskilled Labour',
                experience: 'Verified',
                requestedBy: 'Direct',
                wage: 'Standard',
                workerName: u.name,
                skill: u.skills?.[0] || 'Unskilled Labour',
                expectedWage: 'Standard'
            });
        }
    });

    // Engineers (Internal team, we can use mock since it's internal builder staff for now)
    const engineers = [
        { id: 'e1', name: 'Alok Singh', title: 'Site Engineer', currentlyOnSite: true, status: 'active' },
        { id: 'e2', name: 'Vikram Mehta', title: 'Quality Surveyor', currentlyOnSite: false, status: 'active' }
    ];

    return {
        contractors,
        architects,
        engineers,
        labourRequests
    };
};

// ── Real-time Workflow Services ──────────────────────────────────────────

export const assignContractorToTask = async (projectId, builderId, phaseId, taskId, contractorId) => {
    const project = await BuilderProject.findOneAndUpdate(
        { _id: projectId, builder: builderId, 'workflow._id': phaseId, 'workflow.tasks._id': taskId },
        { $set: { 'workflow.$[p].tasks.$[t].assignedContractor': contractorId } },
        { 
            arrayFilters: [{ 'p._id': phaseId }, { 't._id': taskId }],
            new: true 
        }
    );
    if (!project) {
        const err = new Error('Project, Phase or Task not found');
        err.statusCode = 404;
        throw err;
    }
    return project.workflow;
};

export const updateTaskStatus = async (projectId, phaseId, taskId, status, progress) => {
    const project = await BuilderProject.findOneAndUpdate(
        { _id: projectId, 'workflow._id': phaseId, 'workflow.tasks._id': taskId },
        { 
            $set: { 
                'workflow.$[p].tasks.$[t].status': status,
                'workflow.$[p].tasks.$[t].progress': progress 
            } 
        },
        { 
            arrayFilters: [{ 'p._id': phaseId }, { 't._id': taskId }],
            new: true 
        }
    );
    
    // Auto-calculate phase & project progress could be triggered here
    return project.workflow;
};

// ── Workforce & Labour Services ───────────────────────────────────────────

export const postLabourRequirement = async (projectId, contractorId, data) => {
    const project = await BuilderProject.findByIdAndUpdate(
        projectId,
        { $push: { labourRequirements: { ...data, contractor: contractorId } } },
        { new: true, runValidators: true }
    );
    return project.labourRequirements[project.labourRequirements.length - 1];
};

export const applyForLabourRequirement = async (projectId, requirementId, userId) => {
    const project = await BuilderProject.findOneAndUpdate(
        { _id: projectId, 'labourRequirements._id': requirementId },
        { $push: { 'labourRequirements.$.applicants': { user: userId, status: 'pending' } } },
        { new: true }
    );
    return project.labourRequirements.id(requirementId);
};

export const updateLabourApplicantStatus = async (projectId, requirementId, applicantUserId, status) => {
    const project = await BuilderProject.findOneAndUpdate(
        { 
            _id: projectId, 
            'labourRequirements._id': requirementId,
            'labourRequirements.applicants.user': applicantUserId 
        },
        { $set: { 'labourRequirements.$[r].applicants.$[a].status': status } },
        { 
            arrayFilters: [{ 'r._id': requirementId }, { 'a.user': applicantUserId }],
            new: true 
        }
    );
    return project.labourRequirements.id(requirementId);
};

// ── Daily Update (Site Logs) Services ──────────────────────────────────────

export const submitDailyUpdate = async (projectId, workerId, contractorId, data) => {
    const project = await BuilderProject.findByIdAndUpdate(
        projectId,
        { $push: { dailyUpdates: { ...data, worker: workerId, contractor: contractorId, status: 'pending_verification' } } },
        { new: true }
    );
    return project.dailyUpdates[project.dailyUpdates.length - 1];
};

export const verifyDailyUpdate = async (projectId, updateId, contractorId) => {
    const project = await BuilderProject.findOneAndUpdate(
        { _id: projectId, 'dailyUpdates._id': updateId, contractor: contractorId },
        { 
            $set: { 
                'dailyUpdates.$.status': 'verified',
                'dailyUpdates.$.verifiedAt': new Date()
            } 
        },
        { new: true }
    );
    
    // Logic to increment task progress automatically
    const update = project.dailyUpdates.id(updateId);
    if (update.task) {
        // Find task by title or ID and increment progress (simplified logic)
        // await incrementTaskProgress(projectId, update.task, 5); 
    }

    return update;
};

// ── Issue Tracker Services ──────────────────────────────────────────────────

export const addIssue = async (projectId, userId, data) => {
    const project = await BuilderProject.findByIdAndUpdate(
        projectId,
        { $push: { issues: { ...data, reportedBy: userId } } },
        { new: true }
    );
    return project.issues[project.issues.length - 1];
};

export const updateIssueStatus = async (projectId, issueId, status) => {
    const project = await BuilderProject.findOneAndUpdate(
        { _id: projectId, 'issues._id': issueId },
        { $set: { 'issues.$.status': status } },
        { new: true }
    );
    return project.issues.id(issueId);
};

export const getProjectDashboardStats = async (projectId) => {
    const project = await BuilderProject.findById(projectId)
        .populate('workflow.tasks.assignedContractor', 'name role')
        .populate('dailyUpdates.worker', 'name skills')
        .populate('labourRequirements.applicants.user', 'name skills rating');

    if (!project) throw new Error('Project not found');

    return {
        workflow: project.workflow,
        labourRequirements: project.labourRequirements,
        dailyUpdates: project.dailyUpdates,
        issues: project.issues,
        progress: project.progress // Overall project progress
    };
};

