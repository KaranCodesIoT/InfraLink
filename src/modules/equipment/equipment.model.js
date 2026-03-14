import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String },
        category: { type: String },
        dailyRate: { type: Number, required: true },
        weeklyRate: { type: Number },
        images: [String],
        isAvailable: { type: Boolean, default: true },
        condition: { type: String, enum: ['new', 'excellent', 'good', 'fair'], default: 'good' },
        specifications: { type: mongoose.Schema.Types.Mixed },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
            city: String,
        },
    },
    { timestamps: true }
);

equipmentSchema.index({ location: '2dsphere' });

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;
