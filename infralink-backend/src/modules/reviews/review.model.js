import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, maxlength: 1000 },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ reviewer: 1, job: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
