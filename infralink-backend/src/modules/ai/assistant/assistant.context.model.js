import mongoose from 'mongoose';
import { TOKEN_LIMITS } from '../../../constants/aiConstants.js';

const contextMessageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'model', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const assistantContextSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        persona: {
            type: String,
            default: 'You are an expert InfraLink Personal Assistant specializing in construction industry workflows, project management, material procurement, worker hiring, and safety compliance. Be proactive, accurate, and concise.',
        },
        longTermMemory: {
            preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
            recentJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
            recentWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            notes: [String],
        },
        conversationHistory: {
            type: [contextMessageSchema],
            validate: [arr => arr.length <= TOKEN_LIMITS.ASSISTANT_MAX_HISTORY * 2, 'History limit exceeded'],
        },
        isEnabled: { type: Boolean, default: true },
        lastInteraction: { type: Date, default: Date.now },
    },
    { timestamps: true }
);



const AssistantContext = mongoose.model('AssistantContext', assistantContextSchema);
export default AssistantContext;
