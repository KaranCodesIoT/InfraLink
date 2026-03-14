import mongoose from 'mongoose';
import { MATCH_STATUS } from '../../constants/matchStatus.js';

const matchSchema = new mongoose.Schema(
    {
        job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
        worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        aiScore: { type: Number, min: 0, max: 100 },
        manualScore: { type: Number, min: 0, max: 100 },
        aiReasoning: { type: String },
        status: { type: String, enum: Object.values(MATCH_STATUS), default: 'pending' },
        isAiGenerated: { type: Boolean, default: true },
    },
    { timestamps: true }
);

matchSchema.index({ job: 1, worker: 1 }, { unique: true });
matchSchema.index({ job: 1, aiScore: -1 });

const Match = mongoose.model('Match', matchSchema);
export default Match;
