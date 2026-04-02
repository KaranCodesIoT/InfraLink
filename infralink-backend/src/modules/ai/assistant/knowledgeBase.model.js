import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: [
            'cost_estimation', 'materials', 'regulations',
            'vastu', 'construction_process', 'safety',
            'rera', 'design', 'sustainability', 'faq', 'general'
        ],
        default: 'general',
        index: true
    },
    tags: [{ type: String }],
    embedding: { type: [Number], default: [] },
    metadata: {
        source: { type: String, default: 'manual' },
        region: { type: String, default: 'India' },
        lastUpdated: { type: Date, default: Date.now }
    }
}, { timestamps: true });

// Text index for TF-IDF fallback search
knowledgeBaseSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('KnowledgeBase', knowledgeBaseSchema);
