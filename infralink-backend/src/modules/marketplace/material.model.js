import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
    {
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        brand: { type: String, trim: true },
        description: {
            short: { type: String, required: true },
            detailed: { type: String }
        },
        price: { type: Number, required: true },
        unit: { type: String, required: true }, // kg, ton, bag, piece, sqft
        availableQuantity: { type: Number, required: true, default: 0 },
        moq: { type: Number, required: true, default: 1 },
        bulkPricing: [
            {
                minQty: { type: Number },
                discountPrice: { type: Number }
            }
        ],
        location: {
            warehouseCity: { type: String, required: true },
            pincode: { type: String, required: true }
        },
        serviceAreas: [{ type: String }], // Multi-city support
        deliveryDetails: {
             available: { type: Boolean, default: false },
             charges: { type: Number, default: 0 },
             time: { type: String } // same day / 1-3 days / custom
        },
        images: [
            {
                url: { type: String, required: true },
                isPrimary: { type: Boolean, default: false }
            }
        ],
        status: { 
            type: String, 
            enum: ['in_stock', 'limited', 'out_of_stock'], 
            default: 'in_stock' 
        },
        urgencyTag: { 
            type: String, 
            enum: ['urgent', 'best_price', 'limited_stock', 'none'], 
            default: 'none' 
        },
        paymentOptions: [{ type: String }] // UPI, Bank Transfer, Online, etc.
    },
    { timestamps: true }
);

materialSchema.index({ 'location.warehouseCity': 1 });
materialSchema.index({ category: 1 });

const Material = mongoose.model('Material', materialSchema);
export default Material;
