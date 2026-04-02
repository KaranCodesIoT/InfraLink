import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    intent: { type: String, default: null },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const conversationMemorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    messages: { type: [messageSchema], default: [] },
    lastActive: { type: Date, default: Date.now },
    metadata: {
        totalMessages: { type: Number, default: 0 },
        lastIntent: { type: String, default: null },
        preferredLanguage: { type: String, default: 'en-IN' }
    }
}, { timestamps: true });

// TTL: auto-delete conversations inactive for 24 hours
conversationMemorySchema.index({ lastActive: 1 }, { expireAfterSeconds: 86400 });

// Keep only last 20 messages (sliding window)
conversationMemorySchema.methods.addMessage = function (role, content, intent = null) {
    this.messages.push({ role, content, intent });
    if (this.messages.length > 20) {
        this.messages = this.messages.slice(-20);
    }
    this.lastActive = new Date();
    this.metadata.totalMessages += 1;
    if (intent) this.metadata.lastIntent = intent;
    return this;
};

// Get formatted history for LLM context
conversationMemorySchema.methods.getHistory = function (limit = 10) {
    return this.messages.slice(-limit).map(m => ({
        role: m.role,
        content: m.content
    }));
};

export default mongoose.model('ConversationMemory', conversationMemorySchema);
