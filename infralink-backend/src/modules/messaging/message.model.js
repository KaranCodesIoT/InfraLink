import mongoose from 'mongoose';

// ─── Conversation Schema ──────────────────────────────────────────────────────
const conversationSchema = new mongoose.Schema(
    {
        participants: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        ],
        isRequest: { type: Boolean, default: true },
        isAccepted: { type: Boolean, default: false },
        projectContext: {
            name: { type: String, trim: true },
            budget: { type: String, trim: true },
            location: { type: String, trim: true },
        },
        workIntent: {
            type: String,
            enum: ['hire_now', 'request_quote', null],
            default: null,
        },
        lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ participants: 1, isRequest: 1, isAccepted: 1 });

// ─── Message Schema ───────────────────────────────────────────────────────────
const attachmentSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        type: {
            type: String,
            enum: ['image', 'pdf', 'location'],
            required: true,
        },
        name: { type: String, trim: true },
        size: { type: Number }, // bytes
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: { type: String, trim: true, maxlength: 5000 },
        attachments: [attachmentSchema],
        status: {
            type: String,
            enum: ['sent', 'delivered', 'seen'],
            default: 'sent',
        },
        deliveredAt: { type: Date },
        seenAt: { type: Date },
    },
    { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1, status: 1 });

export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
