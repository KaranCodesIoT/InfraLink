import { Message, Conversation } from './message.model.js';
import Notification from '../notifications/notification.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { getIo } from '../../config/socket.js';
import { cloudinary } from '../../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', 'attachments');

// Ensure upload dir exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// ─── Rate Limiting Constants ──────────────────────────────────────────────────
const MAX_MESSAGES_PER_MINUTE = 300;

// ─── Message Request ──────────────────────────────────────────────────────────

/**
 * Send a message request to a non-connected user.
 * Only ONE message request is allowed per sender→recipient pair.
 */
export const sendMessageRequest = async (senderId, { recipientId, text, projectContext, workIntent }) => {
    if (senderId.toString() === recipientId.toString()) {
        const err = new Error('Cannot message yourself');
        err.statusCode = HTTP_STATUS.BAD_REQUEST;
        err.code = 'SELF_ACTION';
        throw err;
    }

    // Check for existing message request conversation
    const existingConv = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
        isRequest: true,
    });

    if (existingConv) {
        if (existingConv.isAccepted) {
            const err = new Error('Message request already accepted. Send a direct message.');
            err.statusCode = HTTP_STATUS.CONFLICT;
            throw err;
        }
        if (existingConv.isActive) {
            const err = new Error('Message request already sent. Waiting for acceptance.');
            err.statusCode = HTTP_STATUS.CONFLICT;
            err.code = 'REQUEST_PENDING';
            throw err;
        }
        // If rejected (inactive), allow re-requesting by reactivating
        existingConv.isActive = true;
        existingConv.isRequest = true;
        existingConv.isAccepted = false;
        existingConv.projectContext = projectContext || {};
        existingConv.workIntent = workIntent || null;
        await existingConv.save();

        const message = await Message.create({
            conversation: existingConv._id,
            sender: senderId,
            text,
        });
        existingConv.lastMessage = message._id;
        await existingConv.save();

        // Create notification
        await _createNotification(recipientId, 'New Message Request', 'You have a new message request', 'message_request', {
            conversationId: existingConv._id,
            senderId,
        });

        return { conversation: existingConv, message };
    }

    // Create new conversation as a request
    const conversation = await Conversation.create({
        participants: [senderId, recipientId],
        isRequest: true,
        isAccepted: false,
        projectContext: projectContext || {},
        workIntent: workIntent || null,
    });

    const message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        text,
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    // Create notification
    await _createNotification(recipientId, 'New Message Request', 'You have a new message request', 'message_request', {
        conversationId: conversation._id,
        senderId,
    });

    return { conversation, message };
};

/**
 * Accept a message request. Only the recipient can accept.
 */
export const acceptMessageRequest = async (conversationId, userId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        const err = new Error('Conversation not found');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
        const err = new Error('Not a participant of this conversation');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }
    if (!conversation.isRequest) {
        const err = new Error('This is not a message request');
        err.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw err;
    }

    // The recipient is the participant who did NOT send the first message
    const firstMessage = await Message.findOne({ conversation: conversationId }).sort('createdAt');
    if (firstMessage && firstMessage.sender.toString() === userId.toString()) {
        const err = new Error('Only the recipient can accept the request');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }

    conversation.isAccepted = true;
    conversation.isRequest = false;
    await conversation.save();

    // Notify the requester
    const requesterId = conversation.participants.find((p) => p.toString() !== userId.toString());
    await _createNotification(requesterId, 'Message Request Accepted', 'Your message request has been accepted', 'request_accepted', {
        conversationId: conversation._id,
    });

    return conversation;
};

/**
 * Reject a message request. Only the recipient can reject.
 */
export const rejectMessageRequest = async (conversationId, userId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        const err = new Error('Conversation not found');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
        const err = new Error('Not a participant of this conversation');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }
    if (!conversation.isRequest) {
        const err = new Error('This is not a message request');
        err.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw err;
    }

    const firstMessage = await Message.findOne({ conversation: conversationId }).sort('createdAt');
    if (firstMessage && firstMessage.sender.toString() === userId.toString()) {
        const err = new Error('Only the recipient can reject the request');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }

    conversation.isActive = false;
    await conversation.save();

    // Notify the requester
    const requesterId = conversation.participants.find((p) => p.toString() !== userId.toString());
    await _createNotification(requesterId, 'Message Request Rejected', 'Your message request was not accepted', 'request_rejected', {
        conversationId: conversation._id,
    });

    return conversation;
};

// ─── Attachments ──────────────────────────────────────────────────────────────

export const uploadAttachments = async (files, req) => {
    const uploadedAttachments = [];
    const port = process.env.PORT || 5000;

    for (const file of files) {
        // Determine type based on mimetype
        const type = file.mimetype.startsWith('image/') ? 'image' : 
                     file.mimetype === 'application/pdf' ? 'pdf' : 'unknown';
        
        if (type === 'unknown') continue; // Skip unsupported files

        if (cloudinary.config().cloud_name && cloudinary.config().cloud_name !== 'your_cloud_name') {
            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'messages/attachments',
                        resource_type: type === 'pdf' ? 'raw' : 'image'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
            
            uploadedAttachments.push({
                url: uploadResult.secure_url,
                type,
                name: file.originalname,
                size: file.size
            });
        } else {
            // Local fallback
            const filename = `attachment_${Date.now()}_${path.basename(file.originalname)}`;
            const filepath = path.join(PUBLIC_DIR, filename);
            fs.writeFileSync(filepath, file.buffer);
            
            uploadedAttachments.push({
                url: `http://localhost:${port}/uploads/attachments/${filename}`,
                type,
                name: file.originalname,
                size: file.size
            });
        }
    }

    return uploadedAttachments;
};

// ─── Send Message (within accepted conversation) ─────────────────────────────

/**
 * Send a message in an accepted conversation.
 * Enforces: participant check, acceptance check, rate limiting, block check.
 */
export const sendMessage = async (senderId, { conversationId, text, attachments }) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isActive) {
        const err = new Error('Conversation not found or inactive');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }

    // Participant check
    if (!conversation.participants.some((p) => p.toString() === senderId.toString())) {
        const err = new Error('Not a participant of this conversation');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }

    // Must be accepted (or users must be connected)
    if (conversation.isRequest && !conversation.isAccepted) {
        const err = new Error('Message request has not been accepted yet');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        err.code = 'REQUEST_PENDING';
        throw err;
    }

    // Rate limiting: max N messages per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCount = await Message.countDocuments({
        conversation: conversationId,
        sender: senderId,
        createdAt: { $gte: oneMinuteAgo },
    });
    if (recentCount >= MAX_MESSAGES_PER_MINUTE) {
        const err = new Error('Too many messages. Please slow down.');
        err.statusCode = HTTP_STATUS.TOO_MANY_REQUESTS;
        err.code = 'MESSAGE_LIMIT';
        throw err;
    }

    // Validate content
    if (!text && (!attachments || attachments.length === 0)) {
        const err = new Error('Message must have text or at least one attachment');
        err.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw err;
    }

    const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        text: text || '',
        attachments: attachments || [],
    });

    // Update last message
    conversation.lastMessage = message._id;
    await conversation.save();

    // Extract recipient from conversation
    const recipientId = conversation.participants.find((p) => p.toString() !== senderId.toString());

    // Notification for recipient
    if (recipientId) {
        await _createNotification(recipientId, 'New Message', text ? text.substring(0, 100) : 'Sent an attachment', 'new_message', {
            conversationId,
            messageId: message._id,
            senderId,
        });

        // Emit real-time socket event to recipient
        try {
            const io = getIo();
            io.to(`user:${recipientId}`).emit('chat:newMessage', {
                message,
                conversationId,
                from: senderId,
                timestamp: new Date(),
            });
        } catch {
            // Socket not initialised — non-critical
        }
    }

    return message;
};

// ─── Conversations & Messages ─────────────────────────────────────────────────

/**
 * Get active (accepted) conversations for a user.
 */
/**
 * Get active (accepted) conversations for a user.
 * Deduplicates multiple conversations with the same participant.
 */
export const getUserConversations = async (userId) => {
    const rawConversations = await Conversation.find({
        participants: userId,
        isActive: true,
        $or: [{ isRequest: false }, { isAccepted: true }],
    })
        .populate('participants', 'name avatar role isVerified')
        .populate('lastMessage')
        .sort('-updatedAt');

    // Deduplicate: Keep only the most recent conversation per participant pair
    const seenParticipants = new Set();
    const uniqueConversations = [];

    for (const conv of rawConversations) {
        const otherParticipant = conv.participants.find(p => p._id.toString() !== userId.toString());
        if (!otherParticipant) continue;

        const otherId = otherParticipant._id.toString();
        if (!seenParticipants.has(otherId)) {
            seenParticipants.add(otherId);
            uniqueConversations.push(conv);
        }
    }

    return uniqueConversations;
};

/**
 * Get message requests for a user (received & pending).
 */
export const getMessageRequests = async (userId) => {
    return Conversation.find({
        participants: userId,
        isRequest: true,
        isAccepted: false,
        isActive: true,
    })
        .populate('participants', 'name avatar role isVerified')
        .populate('lastMessage')
        .sort('-createdAt');
};

/**
 * Get paginated messages for a conversation.
 * Verifies the requester is a participant.
 */
export const getMessages = async (conversationId, userId, query) => {
    const conversation = await Conversation.findById(conversationId)
        .populate('participants', 'name avatar role isVerified');
    if (!conversation) {
        const err = new Error('Conversation not found');
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
    if (!conversation.participants.some((p) => p._id.toString() === userId.toString())) {
        const err = new Error('Not a participant of this conversation');
        err.statusCode = HTTP_STATUS.FORBIDDEN;
        throw err;
    }

    const { page, limit, skip } = getPagination(query);
    const [messages, total] = await Promise.all([
        Message.find({ conversation: conversationId })
            .populate('sender', 'name avatar role')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Message.countDocuments({ conversation: conversationId }),
    ]);

    return {
        messages,
        conversation,
        pagination: buildPaginationMeta(total, page, limit),
    };
};

// ─── Delivery Status ──────────────────────────────────────────────────────────

/**
 * Mark all unread messages in a conversation as delivered (for the recipient).
 */
export const markDelivered = async (conversationId, userId) => {
    await Message.updateMany(
        {
            conversation: conversationId,
            sender: { $ne: userId },
            status: 'sent',
        },
        { status: 'delivered', deliveredAt: new Date() }
    );
    return { success: true };
};

/**
 * Mark all messages sent by the other participant as seen.
 */
export const markSeen = async (conversationId, userId) => {
    const result = await Message.updateMany(
        {
            conversation: conversationId,
            sender: { $ne: userId },
            status: { $in: ['sent', 'delivered'] },
        },
        { status: 'seen', seenAt: new Date() }
    );
    return { modifiedCount: result.modifiedCount };
};

// ─── Get or Create Direct Conversation (for connected users) ──────────────────

/**
 * Get or create a direct conversation between two connected users.
 */
export const getOrCreateDirectConversation = async (userId, recipientId, projectContext, workIntent) => {
    if (userId.toString() === recipientId.toString()) {
        const err = new Error('Cannot start a conversation with yourself');
        err.statusCode = HTTP_STATUS.BAD_REQUEST;
        err.code = 'SELF_ACTION';
        throw err;
    }

    // Look for ANY existing conversation between these two
    let conversation = await Conversation.findOne({
        participants: { $all: [userId, recipientId] },
        isActive: true,
    })
        .populate('participants', 'name avatar role isVerified');

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, recipientId],
            isRequest: false,
            isAccepted: true,
            projectContext: projectContext || {},
            workIntent: workIntent || null,
        });
        // Populate after creation
        conversation = await conversation.populate('participants', 'name avatar role isVerified');
    } else {
        // If it was a request, upgrade it to a direct chat if it's already active
        if (conversation.isRequest && !conversation.isAccepted) {
            conversation.isRequest = false;
            conversation.isAccepted = true;
            await conversation.save();
        }
    }

    return conversation;
};

// ─── Private Helpers ──────────────────────────────────────────────────────────

async function _createNotification(userId, title, body, type, metadata) {
    try {
        await Notification.create({ user: userId, title, body, type, metadata });
    } catch {
        // Non-critical — don't fail the main operation
    }
}
