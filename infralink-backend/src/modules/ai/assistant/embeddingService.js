import logger from '../../../utils/logger.js';

/**
 * Embedding Service for RAG Pipeline
 * Uses TF-IDF based similarity as the primary approach (zero dependencies, instant).
 * Can be upgraded to @xenova/transformers or OpenAI embeddings later.
 */

/**
 * Simple but effective TF-IDF vectorizer for text similarity.
 * No external dependencies required.
 */
class TFIDFVectorizer {
    constructor() {
        this.vocabulary = new Map();
        this.idf = new Map();
        this.docCount = 0;
    }

    // Tokenize and normalize text
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
    }

    // Build vocabulary from documents
    fit(documents) {
        this.docCount = documents.length;
        const docFreq = new Map();

        documents.forEach(doc => {
            const tokens = new Set(this.tokenize(doc));
            tokens.forEach(token => {
                if (!this.vocabulary.has(token)) {
                    this.vocabulary.set(token, this.vocabulary.size);
                }
                docFreq.set(token, (docFreq.get(token) || 0) + 1);
            });
        });

        // Calculate IDF
        docFreq.forEach((freq, token) => {
            this.idf.set(token, Math.log((this.docCount + 1) / (freq + 1)) + 1);
        });
    }

    // Transform text to TF-IDF vector
    transform(text) {
        const tokens = this.tokenize(text);
        const tf = new Map();

        tokens.forEach(token => {
            tf.set(token, (tf.get(token) || 0) + 1);
        });

        const vector = new Array(this.vocabulary.size).fill(0);
        tf.forEach((count, token) => {
            if (this.vocabulary.has(token)) {
                const idx = this.vocabulary.get(token);
                const idf = this.idf.get(token) || 1;
                vector[idx] = (count / tokens.length) * idf;
            }
        });

        return vector;
    }
}

// Singleton vectorizer
let vectorizer = null;

/**
 * Initialize the vectorizer with existing knowledge documents
 */
export const initVectorizer = (documents) => {
    vectorizer = new TFIDFVectorizer();
    const texts = documents.map(d => `${d.title} ${d.content} ${(d.tags || []).join(' ')}`);
    vectorizer.fit(texts);
    logger.info(`[Embedding] TF-IDF vectorizer initialized with ${documents.length} documents`);
    return vectorizer;
};

/**
 * Generate embedding for a text
 */
export const embedText = (text) => {
    if (!vectorizer) {
        logger.warn('[Embedding] Vectorizer not initialized, using basic tokenization');
        return [];
    }
    return vectorizer.transform(text);
};

/**
 * Compute cosine similarity between two vectors
 */
export const cosineSimilarity = (vecA, vecB) => {
    if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Find most similar documents to a query
 */
export const findSimilar = (queryText, documents, topK = 5) => {
    const queryVec = embedText(queryText);
    if (!queryVec.length) return [];

    const scored = documents.map(doc => {
        const docText = `${doc.title} ${doc.content} ${(doc.tags || []).join(' ')}`;
        const docVec = embedText(docText);
        return {
            ...doc,
            score: cosineSimilarity(queryVec, docVec)
        };
    });

    return scored
        .filter(d => d.score > 0.05)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
};
