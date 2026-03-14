import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, trim: true },
        attachments: [{ url: String, type: { type: String, enum: ['image', 'document'] } }],
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
    },
    { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });

export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
