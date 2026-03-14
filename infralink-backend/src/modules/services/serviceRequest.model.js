import mongoose from 'mongoose';
import { ALL_ROLES } from '../../constants/roles.js';

const SERVICE_TYPES = ['construction', 'architecture', 'labour', 'interior', 'renovation', 'electrical', 'plumbing', 'structural'];
const SERVICE_STATUSES = ['open', 'applied', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed'];

const applicationSchema = new mongoose.Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerRole: { type: String, enum: ALL_ROLES, required: true },
    message: { type: String, maxlength: 1000 },
    proposedPrice: { type: Number, min: 0 },
    appliedAt: { type: Date, default: Date.now },
});

const serviceRequestSchema = new mongoose.Schema(
    {
        // Requester (the hiring party)
        requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        requesterRole: { type: String, enum: ALL_ROLES, required: true },

        // Accepted provider (set when a specific applicant is accepted)
        provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        providerRole: { type: String, enum: ALL_ROLES },

        // Associated Project (if applicable, e.g. Builder hiring for a specific project)
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },

        // Service details
        serviceType: { type: String, enum: SERVICE_TYPES, required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        location: {
            address: String,
            city: String,
            state: String,
            coordinates: { type: [Number], index: '2dsphere' },
        },
        price: {
            amount: { type: Number, min: 0 },
            currency: { type: String, default: 'INR' },
            type: { type: String, enum: ['fixed', 'hourly', 'daily', 'negotiable'], default: 'negotiable' },
        },
        status: { type: String, enum: SERVICE_STATUSES, default: 'open' },

        // Applications from providers
        applications: [applicationSchema],

        // Conversation thread (auto-created on acceptance)
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },

        // Linked payment
        payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },

        // Review after completion
        review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },

        // Timestamps
        acceptedAt: Date,
        startedAt: Date,
        completedAt: Date,
        cancelledAt: Date,
    },
    { timestamps: true }
);

serviceRequestSchema.index({ requester: 1, status: 1 });
serviceRequestSchema.index({ provider: 1, status: 1 });
serviceRequestSchema.index({ serviceType: 1, status: 1, requesterRole: 1 });
serviceRequestSchema.index({ 'location.coordinates': '2dsphere' });

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;
