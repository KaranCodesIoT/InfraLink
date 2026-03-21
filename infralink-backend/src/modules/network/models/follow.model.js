import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
    {
        follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { 
            type: String, 
            enum: ['pending', 'accepted', 'rejected'], 
            default: 'pending',
            required: true 
        }
    },
    { timestamps: true }
);

// Constraints — prevent duplicate follow records
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Performance — compound indexes for status-filtered queries
followSchema.index({ follower: 1, following: 1, status: 1 }); // mutual-follow lookups
followSchema.index({ following: 1, status: 1 });               // incoming requests & follower lists
followSchema.index({ follower: 1, status: 1 });                // outgoing requests & following lists

const Follow = mongoose.model('Follow', followSchema);
export default Follow;
