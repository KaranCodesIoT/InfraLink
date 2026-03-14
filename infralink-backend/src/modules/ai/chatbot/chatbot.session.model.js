import mongoose from 'mongoose';
import { TOKEN_LIMITS, CHATBOT_DEFAULTS } from '../../../constants/aiConstants.js';

const chatMessageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const chatbotSessionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, default: 'New Chat' },
        messages: {
            type: [chatMessageSchema],
            validate: [arr => arr.length <= TOKEN_LIMITS.CHATBOT_MAX_HISTORY * 2, 'Message history limit exceeded'],
        },
        context: { type: String },               // system prompt / persona
        metadata: { type: mongoose.Schema.Types.Mixed },
        isActive: { type: Boolean, default: true },
        lastActivity: { type: Date, default: Date.now },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + CHATBOT_DEFAULTS.SESSION_TTL_MINUTES * 60 * 1000),
        },
    },
    { timestamps: true }
);

chatbotSessionSchema.index({ user: 1, isActive: 1 });
chatbotSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const ChatbotSession = mongoose.model('ChatbotSession', chatbotSessionSchema);
export default ChatbotSession;
