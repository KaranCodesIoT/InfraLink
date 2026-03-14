import escalationQueue from '../queues/escalation.queue.js';
import Escalation from '../modules/ai/escalation/escalation.model.js';
import User from '../modules/users/user.model.js';
import { ESCALATION_STATUS } from '../constants/aiConstants.js';
import { emitNotification } from '../events/notification.events.js';
import logger from '../utils/logger.js';

escalationQueue.process(3, async (job) => {
    const { escalationId, priority } = job.data;
    logger.info(`Processing escalation ${escalationId} (priority: ${priority})`);

    try {
        // Find an available support agent (role: 'admin' or 'support')
        const agent = await User.findOne({ role: { $in: ['admin', 'support'] }, isActive: true }).sort('lastSeen');

        if (!agent) {
            logger.warn(`No agent available for escalation ${escalationId}. Will retry.`);
            throw new Error('No support agents available');
        }

        await Escalation.findByIdAndUpdate(escalationId, {
            status: ESCALATION_STATUS.ASSIGNED,
            assignedAgent: agent._id,
        });

        // Notify the assigned agent
        emitNotification({
            userId: agent._id,
            title: 'New escalation assigned to you',
            body: `Priority: ${priority}. Please review and respond promptly.`,
            type: 'escalation_assigned',
            metadata: { escalationId },
        });

        logger.info(`Escalation ${escalationId} assigned to agent ${agent._id}`);
        return { escalationId, assignedTo: agent._id };
    } catch (error) {
        logger.error(`Escalation processor error: ${error.message}`);
        throw error;
    }
});

escalationQueue.on('completed', (job, result) => {
    logger.info(`Escalation job ${job.id} completed — assigned to ${result.assignedTo}`);
});
