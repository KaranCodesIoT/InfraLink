import eventBus from './eventBus.js';
import logger from '../utils/logger.js';
import { getIo } from '../config/socket.js';

export const PROJECT_EVENTS = {
    CREATED: 'project:created',
    UPDATED: 'project:updated',
    DELETED: 'project:deleted',
    MILESTONE_COMPLETED: 'project:milestoneCompleted',
};

// Listeners
eventBus.on(PROJECT_EVENTS.UPDATED, (project) => {
    logger.info(`[Event] ${PROJECT_EVENTS.UPDATED} — projectId: ${project._id || project.id}`);
    const io = getIo();
    if (io) {
        io.to(`project:${project._id || project.id}`).emit(PROJECT_EVENTS.UPDATED, project);
    }
});

// Emitters
export const emitProjectCreated = (project) => eventBus.emit(PROJECT_EVENTS.CREATED, project);
export const emitProjectUpdated = (project) => eventBus.emit(PROJECT_EVENTS.UPDATED, project);
export const emitProjectDeleted = (projectId) => eventBus.emit(PROJECT_EVENTS.DELETED, projectId);
export const emitMilestoneCompleted = (project, milestoneId) => eventBus.emit(PROJECT_EVENTS.MILESTONE_COMPLETED, { project, milestoneId });
