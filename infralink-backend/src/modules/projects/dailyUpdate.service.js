import DailyUpdate from './dailyUpdate.model.js';
import Project from './project.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import * as workerScoreService from './workerScore.service.js';
import { recalculateProjectProgress } from './project.service.js';

/* ─────────────────────────── Helpers ──────────────────────────── */

const throwErr = (msg, code = 400) => {
    const e = new Error(msg);
    e.statusCode = code;
    throw e;
};

/**
 * Normalise a date to midnight UTC (strips time component).
 * This ensures the compound unique index works correctly.
 */
const normaliseDate = (d = new Date()) => {
    const dt = new Date(d);
    dt.setUTCHours(0, 0, 0, 0);
    return dt;
};

/* ────────────────── Submit Daily Update ──────────────────────── */

export const submitUpdate = async (projectId, workerId, data, mediaUrls = []) => {
    // 1. Validate project access
    const project = await Project.findById(projectId);
    if (!project) throwErr('Project not found', 404);
    if (project.status !== 'active') throwErr('Project is not active');

    const assignment = project.assignedWorkers.find(
        w => w.user.toString() === workerId.toString() && w.status === 'accepted'
    );
    if (!assignment) throwErr('You are not an accepted worker on this project', 403);

    // 2. Build media array
    const media = mediaUrls.map((url, i) => ({
        url,
        type: /\.(mp4|mov|avi|webm)$/i.test(url) ? 'video' : 'image',
        caption: data.mediaCaptions?.[i] || '',
    }));

    // 3. Determine if late (after 9 PM IST = 15:30 UTC)
    const now = new Date();
    const isLate = now.getUTCHours() >= 16; // after ~9:30 PM IST

    const todayNorm = normaliseDate(now);

    // 4. Create update (compound index will reject duplicates)
    try {
        const update = await DailyUpdate.create({
            project: projectId,
            worker: workerId,
            date: todayNorm,
            textNote: data.textNote,
            media,
            hoursWorked: data.hoursWorked,
            isLate,
            submittedAt: now,
        });

        // 5. Award points
        const points = isLate ? 2 : 5;
        const reason = isLate ? 'Late daily update' : 'On-time daily update';
        await workerScoreService.awardPoints(workerId, points, reason, projectId);

        // 6. Recalculate smart flipkart-style progress
        recalculateProjectProgress(projectId).catch(err => console.error('Auto-progress error:', err));

        return update;
    } catch (err) {
        if (err.code === 11000) {
            throwErr('You have already submitted an update for today');
        }
        throw err;
    }
};

/* ────────────── Get Updates for a Project (Timeline) ─────────── */

export const getProjectUpdates = async (projectId, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = { project: projectId };

    // Filter by worker
    if (query.workerId) filter.worker = query.workerId;

    // Filter by date
    if (query.date) filter.date = normaliseDate(query.date);

    const [updates, total] = await Promise.all([
        DailyUpdate.find(filter)
            .populate('worker', 'name avatar role')
            .sort('-date -submittedAt')
            .skip(skip)
            .limit(limit)
            .lean(),
        DailyUpdate.countDocuments(filter),
    ]);

    return { updates, pagination: buildPaginationMeta(total, page, limit) };
};

/* ────────────── Get Missing Updates (Smart Detection) ────────── */

export const getMissingUpdates = async (projectId, date) => {
    const project = await Project.findById(projectId)
        .populate('assignedWorkers.user', 'name avatar')
        .lean();
    if (!project) throwErr('Project not found', 404);

    const checkDate = normaliseDate(date || new Date());

    // Get all accepted workers
    const acceptedWorkers = project.assignedWorkers.filter(w => w.status === 'accepted');

    // Get all updates for this date
    const updates = await DailyUpdate.find({
        project: projectId,
        date: checkDate,
    }).lean();

    const updatedWorkerIds = new Set(updates.map(u => u.worker.toString()));

    // Workers who didn't submit
    const missing = acceptedWorkers
        .filter(w => !updatedWorkerIds.has(w.user._id.toString()))
        .map(w => ({
            user: w.user,
            workCategory: w.workCategory,
        }));

    return { date: checkDate, missing, totalAccepted: acceptedWorkers.length, totalSubmitted: updates.length };
};

/* ────────── Get Worker's Update History across Projects ──────── */

export const getWorkerUpdateHistory = async (workerId, projectId, query) => {
    const { page, limit, skip } = getPagination(query);
    const filter = { worker: workerId };
    if (projectId) filter.project = projectId;

    const [updates, total] = await Promise.all([
        DailyUpdate.find(filter)
            .populate('project', 'title')
            .sort('-date')
            .skip(skip)
            .limit(limit)
            .lean(),
        DailyUpdate.countDocuments(filter),
    ]);

    return { updates, pagination: buildPaginationMeta(total, page, limit) };
};

/* ────────── Check if worker already submitted today ──────────── */

export const hasSubmittedToday = async (projectId, workerId) => {
    const today = normaliseDate(new Date());
    const existing = await DailyUpdate.findOne({
        project: projectId,
        worker: workerId,
        date: today,
    }).lean();
    return !!existing;
};
