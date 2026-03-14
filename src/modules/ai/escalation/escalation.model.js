import mongoose from 'mongoose';
import { ESCALATION_STATUS } from '../../../constants/aiConstants.js';

const escalationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        chatSession: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatbotSession' },
        subject: { type: String, required: true },
        description: { type: String, required: true },
        aiSummary: { type: String },            // AI-generated summary of the unresolved issue
        priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
        status: {
            type: String,
            enum: Object.values(ESCALATION_STATUS),
            default: ESCALATION_STATUS.PENDING,
        },
        assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        resolution: { type: String },
        attachments: [String],
        metadata: { type: mongoose.Schema.Types.Mixed },
        resolvedAt: { type: Date },
    },
    { timestamps: true }
);

escalationSchema.index({ user: 1, status: 1 });
escalationSchema.index({ assignedAgent: 1, status: 1 });
escalationSchema.index({ status: 1, priority: 1 });

const Escalation = mongoose.model('Escalation', escalationSchema);
export default Escalation;
