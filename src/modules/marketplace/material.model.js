import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
    {
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String },
        category: { type: String, trim: true },
        price: { type: Number, required: true },
        unit: { type: String, default: 'unit' },
        quantity: { type: Number, default: 0 },
        images: [String],
        isAvailable: { type: Boolean, default: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
            city: String,
        },
    },
    { timestamps: true }
);

materialSchema.index({ location: '2dsphere' });

const Material = mongoose.model('Material', materialSchema);
export default Material;
