import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        body: { type: String },
        type: {
            type: String,
            enum: [
                'job_match',
                'application_update',
                'message',
                'payment',
                'review',
                'system',
                // Messaging & Connection types
                'message_request',
                'request_accepted',
                'request_rejected',
                'new_message',
                'follow_request',
                'follow_accepted',
            ],
            default: 'system',
        },
        metadata: { type: mongoose.Schema.Types.Mixed },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
