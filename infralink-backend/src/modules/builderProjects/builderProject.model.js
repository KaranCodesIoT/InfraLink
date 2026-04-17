import mongoose from 'mongoose';

const builderProjectSchema = new mongoose.Schema(
    {
        // ── Step 1: Basic Info ──────────────────────────────────────────────
        projectName: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        area: { type: String, required: true, trim: true },
        propertyType: {
            type: String,
            enum: ['Flat', 'Villa', 'Commercial'],
            required: true,
        },
        configuration: {
            type: String,
            required: true,
            trim: true,
        },
        projectStatus: {
            type: String,
            enum: ['Under Construction', 'Ready to Move'],
            required: true,
        },

        // ── Step 2: Pricing & Units ─────────────────────────────────────────
        price: { type: Number, required: true, min: 0 },
        totalUnits: { type: Number, required: true, min: 1 },
        availableUnits: { type: Number, required: true, min: 0 },
        possessionDate: { type: Date },

        // ── Step 3: Media ───────────────────────────────────────────────────
        images: {
            type: [String],
            validate: {
                validator: (v) => v.length >= 3,
                message: 'At least 3 images are required',
            },
        },
        video: { type: String },
        arModelUrl: { type: String, trim: true },
        description: { type: String, required: true },

        // ── Step 4: Trust & Details ─────────────────────────────────────────
        reraNumber: { type: String, trim: true },
        amenities: [{ type: String, trim: true }],
        nearbyFacilities: [{ type: String, trim: true }],

        // ── Engagement ──────────────────────────────────────────────────────
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        comments: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            text: { type: String, required: true, trim: true, maxlength: 500 },
            createdAt: { type: Date, default: Date.now },
        }],

        // ── Professional Applications ───────────────────────────────────────
        applications: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, required: true },
            status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
            appliedAt: { type: Date, default: Date.now },
        }],

        // ── Project Updates ─────────────────────────────────────────────────
        updates: [
            {
                text: { type: String, required: true },
                media: [{ type: String }],
                createdAt: { type: Date, default: Date.now }
            }
        ],

        // ── Builder ref ─────────────────────────────────────────────────────
        builder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // ── Real-time Workflow (Phase & Tasks) ──────────────────────────────
        workflow: [{
            phaseName: { type: String, required: true },
            status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
            progress: { type: Number, default: 0 },
            tasks: [{
                title: { type: String, required: true },
                description: { type: String },
                status: { type: String, enum: ['todo', 'in_progress', 'review', 'done'], default: 'todo' },
                priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
                progress: { type: Number, default: 0 },
                assignedContractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
                startDate: { type: Date },
                dueDate: { type: Date },
                weight: { type: Number, default: 1 }, // Used for progress calculation
            }]
        }],

        // ── Workforce & Labour Requirements ──────────────────────────────────
        labourRequirements: [{
            contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            skill: { type: String, required: true },
            count: { type: Number, required: true },
            description: { type: String },
            status: { type: String, enum: ['open', 'closed'], default: 'open' },
            applicants: [{
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
                appliedAt: { type: Date, default: Date.now }
            }],
            createdAt: { type: Date, default: Date.now }
        }],

        // ── Daily Site Logs (Worker Submissions) ────────────────────────────
        dailyUpdates: [{
            task: { type: String }, // Can be task ID or Title mapping
            worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            summary: { type: String, required: true },
            activities: [{ type: String }],
            materialsUsed: [{ 
                name: { type: String }, 
                quantity: { type: String } 
            }],
            status: { type: String, enum: ['pending_verification', 'verified'], default: 'pending_verification' },
            date: { type: Date, default: Date.now },
            verifiedAt: { type: Date }
        }],

        // ── Issue Tracker ────────────────────────────────────────────────────
        issues: [{
            title: { type: String, required: true },
            description: { type: String, required: true },
            severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
            status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
            reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Usually a contractor
            taskId: { type: String },
            createdAt: { type: Date, default: Date.now }
        }],

    },
    { timestamps: true }
);

builderProjectSchema.index({ city: 1, propertyType: 1 });
builderProjectSchema.index({ builder: 1 });

const BuilderProject = mongoose.model('BuilderProject', builderProjectSchema);
export default BuilderProject;
