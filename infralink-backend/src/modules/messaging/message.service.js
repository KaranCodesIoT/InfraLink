import { Message, Conversation } from './message.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const getOrCreateConversation = async (userId, recipientId, jobId) => {
    let conversation = await Conversation.findOne({
        participants: { $all: [userId, recipientId] },
        ...(jobId && { job: jobId }),
    });
    if (!conversation) {
        conversation = await Conversation.create({ participants: [userId, recipientId], job: jobId });
    }
    return conversation;
};

export const sendMessage = async (senderId, { recipientId, jobId, content }) => {
    const conversation = await getOrCreateConversation(senderId, recipientId, jobId);
    const message = await Message.create({ conversation: conversation._id, sender: senderId, content });
    await Conversation.findByIdAndUpdate(conversation._id, { lastMessage: message._id });
    return message;
};

export const getMessages = async (conversationId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const [messages, total] = await Promise.all([
        Message.find({ conversation: conversationId }).populate('sender', 'name avatar').sort(sort || 'createdAt').skip(skip).limit(limit),
        Message.countDocuments({ conversation: conversationId }),
    ]);
    return { messages, pagination: buildPaginationMeta(total, page, limit) };
};

export const getUserConversations = async (userId) => {
    return Conversation.find({ participants: userId, isActive: true })
        .populate('participants', 'name avatar')
        .populate('lastMessage')
        .sort('-updatedAt');
};
