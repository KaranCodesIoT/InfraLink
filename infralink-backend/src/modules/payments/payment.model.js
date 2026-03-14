import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        provider: { type: String, enum: ['razorpay', 'stripe', 'manual'], default: 'razorpay' },
        providerId: { type: String }, // external order/payment ID
        providerOrderId: { type: String },
        refundId: { type: String },
        description: { type: String },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

paymentSchema.index({ payer: 1, createdAt: -1 });
paymentSchema.index({ job: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
