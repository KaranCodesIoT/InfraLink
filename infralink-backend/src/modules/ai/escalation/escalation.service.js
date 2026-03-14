import Escalation from './escalation.model.js';
import { escalationQueue } from '../../../queues/escalation.queue.js';
import { ESCALATION_STATUS } from '../../../constants/aiConstants.js';
import { getModel } from '../../../config/ai.js';
import { AI_MODELS } from '../../../constants/aiConstants.js';
import { getPagination, buildPaginationMeta } from '../../../utils/pagination.utils.js';
import { emitNotification } from '../../../events/notification.events.js';
import logger from '../../../utils/logger.js';

export const createEscalation = async (userId, { subject, description, chatSession, priority, attachments }) => {
    // Generate AI summary of the issue
    let aiSummary = description;
    try {
        const model = getModel(AI_MODELS.GEMINI_1_5_FLASH);
        const result = await model.generateContent(
            `Summarise this support issue in 2 concise sentences for a human agent: "${description}"`
        );
        aiSummary = result.response.text().trim();
    } catch (err) {
        logger.warn(`AI summary for escalation failed: ${err.message}`);
    }

    const escalation = await Escalation.create({
        user: userId, subject, description, aiSummary, chatSession, priority, attachments,
    });

    // Queue for agent assignment
    await escalationQueue.add({ escalationId: escalation._id, priority }, { priority: priority === 'urgent' ? 1 : 3 });

    return escalation;
};

export const getEscalations = async (userId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { user: userId };
    if (query.status) filter.status = query.status;
    const [escalations, total] = await Promise.all([
        Escalation.find(filter).populate('assignedAgent', 'name email').sort(sort || '-createdAt').skip(skip).limit(limit),
        Escalation.countDocuments(filter),
    ]);
    return { escalations, pagination: buildPaginationMeta(total, page, limit) };
};

export const getEscalationById = async (id) => {
    const e = await Escalation.findById(id).populate('user', 'name email').populate('assignedAgent', 'name email');
    if (!e) { const err = new Error('Escalation not found'); err.statusCode = 404; throw err; }
    return e;
};

export const resolveEscalation = async (id, agentId, resolution) => {
    const escalation = await Escalation.findByIdAndUpdate(
        id,
        { status: ESCALATION_STATUS.RESOLVED, resolution, resolvedAt: new Date(), assignedAgent: agentId },
        { new: true }
    );
    if (!escalation) { const e = new Error('Escalation not found'); e.statusCode = 404; throw e; }

    emitNotification({
        userId: escalation.user,
        title: 'Your support request has been resolved',
        body: resolution,
        type: 'escalation_resolved',
        metadata: { escalationId: id },
    });

    return escalation;
};
