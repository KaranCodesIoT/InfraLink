import { pipeline } from '@xenova/transformers';

class EmbeddingService {
    static instance = null;

    static async getInstance() {
        if (!this.instance) {
            // Use Xenova's all-MiniLM-L6-v2 model which produces 384-dimensional embeddings
            this.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                quantized: true, // Uses less memory and disk
            });
        }
        return this.instance;
    }

    /**
     * Generate 384-dimensional vector embedding for a given text
     */
    static async generateEmbedding(text) {
        try {
            if (!text || typeof text !== 'string') return [];
            
            const extractor = await this.getInstance();
            const output = await extractor(text, { pooling: 'mean', normalize: true });
            return Array.from(output.data);
        } catch (error) {
            console.error('Error generating embedding:', error);
            return [];
        }
    }

    /**
     * Helper to build a searchable text block for a professional
     * Expects a cleaned user object (e.g. from getProfessionalById or similar structure)
     */
    static buildProfessionalText(user) {
        const role = user.role || 'professional';
        const name = user.fullName || user.companyName || user.name || 'Unknown';
        const location = user.location?.city ? `in ${user.location.city}` : '';
        const state = user.location?.state ? `, ${user.location.state}` : '';
        const experience = user.yearsOfExperience || user.experience ? `with ${user.yearsOfExperience || user.experience} experience` : '';
        const skills = Array.isArray(user.skills) && user.skills.length > 0 ? `Skills: ${user.skills.join(', ')}.` : '';
        const rating = user.averageRating ? `Rating: ${Number(user.averageRating).toFixed(1)}.` : '';
        const price = user.hourlyRate ? `Charges ₹${user.hourlyRate}/hour.` : (user.dailyRate ? `Charges ₹${user.dailyRate}/day.` : '');
        const bio = user.bio ? `Bio: ${user.bio}` : '';

        return `${name} is a ${role} ${location}${state} ${experience}. ${skills} ${rating} ${price} ${bio}`.trim().replace(/\s+/g, ' ');
    }
}

export default EmbeddingService;
