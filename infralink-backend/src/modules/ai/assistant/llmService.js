import { getGroq, GROQ_MODELS } from '../../../config/groq.js';
import logger from '../../../utils/logger.js';

/**
 * Enhanced LLM Service — Intelligent responses with recommendations and follow-ups
 */

const SYSTEM_PROMPTS = {
    find_worker: `You are Infralink AI — a smart, conversational construction assistant (like Urban Company meets Gemini).

You were given worker search results from the database. Your job:
1. **Recommend the top 2-3 workers** — explain WHY each is a good fit (skill match, rating, location).
2. Use a friendly, helpful tone. Be specific about each worker.
3. End with a **follow-up question** to help the user further, such as:
   - "What's your budget for this work?"
   - "Is this urgent or can it wait a few days?"
   - "Would you like me to share their contact details?"
   - "Do you need this work done at a specific time?"

Format:
- Use **bold** for names and key details
- Use bullet points for clarity
- Keep it conversational, not robotic
- If no workers found, suggest broadening the search

IMPORTANT: DO NOT list all workers robotically. RECOMMEND and EXPLAIN like a helpful assistant.`,

    project_search: `You are Infralink AI — a construction & real estate assistant.
The user is browsing projects. Present each attractively:
- Highlight premium features
- Mention if 3D/AR view is available
- Compare budget ranges
- Ask if they want similar projects or different criteria
Keep it engaging and sales-friendly.`,

    cost_estimation: `You are Infralink AI — a construction cost estimation expert in India.
Use the provided knowledge to give DETAILED, PRACTICAL cost breakdowns:
- Per sq.ft rates with Indian Rupee (₹)
- Itemized component breakdown (foundation, structure, finishing, MEP)
- Factors affecting cost (city, quality, material choice)
- Total range (budget vs premium)

After the estimate, ask follow-up:
- "What city are you building in? Rates vary by location."
- "Do you want a basic, standard, or premium finish?"
- "Should I help you find contractors for this project?"`,

    material_search: `You are Infralink AI — a construction materials advisor.
Present materials with prices, quality comparisons, and recommendations.
Ask follow-ups like:
- "How much quantity do you need?"
- "Do you want delivery to your site?"`,

    job_search: `You are Infralink AI — helping users find construction jobs.
Present jobs attractively. Ask:
- "What skills do you have?"
- "Which area do you prefer to work in?"`,

    navigation: `You are Infralink AI. Confirm the navigation briefly and helpfully.`,

    platform_help: `You are Infralink AI. Infralink connects builders, contractors, architects, labourers, and suppliers.
Features: AI worker search, 3D/AR project viewing, job board, messaging, material marketplace.
Guide the user step by step. Be warm and helpful. Always end with a suggestion of what they can try next.`,

    general: `You are Infralink AI — a state-of-the-art construction & real estate assistant.
Be conversational, smart, and helpful. Like chatting with an expert friend.
If the user is vague, ask clarifying questions. Always suggest next actions.
Keep responses concise but warm. Use Indian context (₹, sq.ft, Indian cities).`
};

/**
 * Generate LLM response with conversation history
 */
export const generateResponse = async ({
    systemPrompt,
    userQuery,
    contextData = null,
    conversationHistory = [],
    intent = 'general',
    maxTokens = 1024,
    onChunk = null
}) => {
    const groq = getGroq();
    if (!groq) {
        throw new Error('Groq client not initialized. Check GROQ_API_KEY.');
    }

    let fullPrompt = userQuery;
    if (contextData) {
        const contextStr = typeof contextData === 'string' ? contextData : JSON.stringify(contextData, null, 2);
        fullPrompt = `Database Results / Context:\n${contextStr}\n\nUser Query: ${userQuery}`;
    }

    const messages = [
        { role: "system", content: systemPrompt || SYSTEM_PROMPTS[intent] || SYSTEM_PROMPTS.general }
    ];

    // Add conversation history (last 6 turns)
    if (conversationHistory.length > 0) {
        conversationHistory.slice(-6).forEach(msg => {
            messages.push({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            });
        });
    }

    messages.push({ role: "user", content: fullPrompt });

    // Retry with backoff
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const streamResponse = await groq.chat.completions.create({
                messages,
                model: GROQ_MODELS.LLAMA_3_3_70B || GROQ_MODELS.LLAMA_3_1_70B,
                temperature: intent === 'cost_estimation' ? 0.3 : 0.65,
                max_tokens: maxTokens,
                top_p: 1,
                stream: true,
            });

            let fullContent = "";
            for await (const chunk of streamResponse) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    fullContent += content;
                    if (onChunk) onChunk(content);
                }
            }
            return fullContent || "I'm sorry, I couldn't generate a response.";
        } catch (error) {
            lastError = error;
            logger.warn(`[LLM] Attempt ${attempt + 1} failed: ${error.message}`);
            if (error.status === 429) {
                await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
            } else {
                throw error;
            }
        }
    }
    throw lastError;
};

/**
 * Build a worker-specific context for LLM — highlights top picks and scores
 */
export const buildWorkerContext = (dbResults, searchCriteria) => {
    if (!dbResults?.results?.length) return 'No workers found matching the criteria.';

    const { skill, area, city } = searchCriteria || {};
    let context = `Search: skill="${skill || 'any'}", location="${area || city || 'any'}"\n`;
    context += `Found ${dbResults.count} workers. Tier: ${dbResults.tier}\n\n`;

    dbResults.results.forEach((w, i) => {
        context += `Worker ${i + 1}${w._isTopPick ? ' ⭐ TOP PICK' : ''}:\n`;
        context += `  Name: ${w.name}\n`;
        context += `  Type: ${w.contractorType || w.role || 'Professional'}\n`;
        context += `  Skills: ${Array.isArray(w.skills) ? w.skills.join(', ') : 'N/A'}\n`;
        context += `  Location: ${w.location?.city || w.location?.address || 'N/A'}\n`;
        context += `  Rating: ${w.rating || 'N/A'}/5\n`;
        context += `  Experience: ${w.experience || 'N/A'}\n`;
        context += `  Match Score: ${w._score}/100\n\n`;
    });

    return context;
};

const GLOBAL_STRICT_RULES = `You are an AI assistant for the InfraLink platform.

STRICT RULES:
1. You must ONLY answer queries related to the InfraLink platform.
2. Your knowledge is LIMITED to:
   - Construction projects
   - Builders, contractors, workers
   - Job postings and applications
   - Platform features (chat, hiring, tracking, payments)
   - Data provided from the platform database

3. You are NOT allowed to answer:
   - General knowledge questions
   - Personal questions
   - Questions unrelated to construction or InfraLink
   - Any external or factual information outside the platform

4. If a user asks something outside scope, respond with:
   "I am only designed to assist with InfraLink platform features and construction-related queries."

5. Always prioritize:
   - Helping users navigate the platform
   - Answering based on database data (if available)
   - Validating inputs (like job details, worker info, etc.)

6. Keep responses:
   - Short
   - Clear
   - Professional

7. Do NOT hallucinate or guess information.
8. If data is not available, say:
   "This information is not available in the system."

ROLE BEHAVIOR:
- Act like a platform assistant, not a general AI
- Help builders, contractors, and workers
- Guide users step-by-step if needed`;

/**
 * Get system prompt for a given intent
 */
export const getSystemPrompt = (intent) => {
    const specificPrompt = SYSTEM_PROMPTS[intent] || SYSTEM_PROMPTS.general;
    return `${GLOBAL_STRICT_RULES}\n\n[CONTEXT SPECIFIC DIRECTIVES]\n${specificPrompt}`;
};

/**
 * Lightweight classification call to Groq (for fallback intent detection)
 */
export const classifyIntent = async (query) => {
    const groq = getGroq();
    if (!groq) return 'general';

    const systemPrompt = `Classify user intent into one of: 'find_worker', 'project_search', 'cost_estimation', 'material_search', 'job_search', 'navigation', 'platform_help', 'general'.
    Respond with ONLY the intent string.
    Examples:
    - "need electrician in mumbai" -> find_worker
    - "show luxury villas" -> project_search
    - "how much to build a 2bhk" -> cost_estimation
    - "price of cement" -> material_search
    - "any job for plumber" -> job_search
    - "open my profile" -> navigation
    - "how do I post a job" -> platform_help`;

    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ],
            model: GROQ_MODELS.MIXTRAL_8X7B,
            temperature: 0,
            max_tokens: 20,
        });

        return response.choices[0]?.message?.content.trim().toLowerCase().replace(/['"]/g, '') || 'general';
    } catch {
        return 'general';
    }
};
