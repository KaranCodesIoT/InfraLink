import Project from '../modules/projects/project.model.js';
import DailyUpdate from '../modules/projects/dailyUpdate.model.js';
import * as workerScoreService from '../modules/projects/workerScore.service.js';
import { emitMissingUpdate } from '../events/project.events.js';
import logger from '../utils/logger.js';

/**
 * Normalise date to midnight UTC
 */
const normaliseDate = (d = new Date()) => {
    const dt = new Date(d);
    dt.setUTCHours(0, 0, 0, 0);
    return dt;
};

/**
 * Detect missing daily updates and penalise workers.
 * Should run once per day (late evening).
 */
export const detectMissingUpdates = async () => {
    try {
        const today = normaliseDate(new Date());

        // Find all active projects
        const activeProjects = await Project.find({ status: 'active' })
            .populate('assignedWorkers.user', 'name')
            .lean();

        let totalPenalties = 0;

        for (const project of activeProjects) {
            // Only check projects where startDate <= today <= endDate
            if (new Date(project.startDate) > today || new Date(project.endDate) < today) continue;

            const acceptedWorkers = project.assignedWorkers.filter(w => w.status === 'accepted');
            if (acceptedWorkers.length === 0) continue;

            // Find updates submitted today
            const updates = await DailyUpdate.find({
                project: project._id,
                date: today,
            }).lean();
            const updatedWorkerIds = new Set(updates.map(u => u.worker.toString()));

            // Penalise missing workers
            for (const worker of acceptedWorkers) {
                const wId = worker.user._id.toString();
                if (!updatedWorkerIds.has(wId)) {
                    await workerScoreService.awardPoints(
                        wId, -3, 'Missed daily update', project._id
                    );
                    emitMissingUpdate(project._id, wId, worker.user.name);
                    totalPenalties++;
                }
            }
        }

        logger.info(`[ProjectCron] Missing update check complete. ${totalPenalties} penalties issued.`);
    } catch (err) {
        logger.error(`[ProjectCron] Error during missing update detection: ${err.message}`);
    }
};

/**
 * Schedule the missing update check to run daily at 11:30 PM IST (18:00 UTC).
 * Uses simple setInterval-based scheduling.
 */
export const startProjectCron = () => {
    const runAt = () => {
        const now = new Date();
        const target = new Date(now);
        target.setUTCHours(18, 0, 0, 0); // 11:30 PM IST = 18:00 UTC

        if (target <= now) {
            target.setDate(target.getDate() + 1); // next day
        }

        return target.getTime() - now.getTime();
    };

    const scheduleNext = () => {
        const delay = runAt();
        logger.info(`[ProjectCron] Next missing-update check in ${Math.round(delay / 1000 / 60)} minutes`);

        setTimeout(async () => {
            await detectMissingUpdates();
            scheduleNext(); // reschedule for next day
        }, delay);
    };

    scheduleNext();
    logger.info('[ProjectCron] Daily missing-update detection scheduled');
};
