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
        description: { type: String, required: true },

        // ── Step 4: Trust & Details ─────────────────────────────────────────
        reraNumber: { type: String, trim: true },
        amenities: [{ type: String, trim: true }],
        nearbyFacilities: [{ type: String, trim: true }],

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
    },
    { timestamps: true }
);

builderProjectSchema.index({ city: 1, propertyType: 1 });
builderProjectSchema.index({ builder: 1 });

const BuilderProject = mongoose.model('BuilderProject', builderProjectSchema);
export default BuilderProject;
