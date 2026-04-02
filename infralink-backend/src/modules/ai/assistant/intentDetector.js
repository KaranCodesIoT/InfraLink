import { classifyIntent } from './llmService.js';
import logger from '../../../utils/logger.js';

/**
 * Enhanced Intent Detection with STRICT skill extraction.
 * When user says "electrician" → skill MUST be "electrician", not a broad search.
 */

// ─── Skill Dictionary (exact skills for strict matching) ──────────────────────
const SKILL_DICTIONARY = [
    // Compound skills (check first — longest match wins)
    'general contractor', 'interior contractor', 'civil contractor',
    'electrical contractor', 'plumbing contractor', 'interior designer',
    'structural engineer', 'civil engineer', 'landscape architect',
    'modular kitchen', 'false ceiling', 'solar panel installer',
    'waterproofing expert', 'demolition expert', 'hvac technician',
    // Single-word skills
    'electrician', 'plumber', 'painter', 'architect', 'carpenter',
    'mason', 'welder', 'tiler', 'labour', 'worker', 'builder',
    'supplier', 'contractor', 'surveyor', 'roofer', 'glazier',
    'landscaper', 'fabricator', 'polisher', 'plasterer'
];

// ─── Location Dictionary with hierarchy ───────────────────────────────────────
const LOCATION_HIERARCHY = {
    // Mumbai areas → parent city
    'andheri': { area: 'andheri', city: 'mumbai' },
    'powai': { area: 'powai', city: 'mumbai' },
    'bandra': { area: 'bandra', city: 'mumbai' },
    'juhu': { area: 'juhu', city: 'mumbai' },
    'borivali': { area: 'borivali', city: 'mumbai' },
    'dadar': { area: 'dadar', city: 'mumbai' },
    'worli': { area: 'worli', city: 'mumbai' },
    'malad': { area: 'malad', city: 'mumbai' },
    'goregaon': { area: 'goregaon', city: 'mumbai' },
    'kandivali': { area: 'kandivali', city: 'mumbai' },
    'jogeshwari': { area: 'jogeshwari', city: 'mumbai' },
    'versova': { area: 'versova', city: 'mumbai' },
    'lower parel': { area: 'lower parel', city: 'mumbai' },
    'colaba': { area: 'colaba', city: 'mumbai' },
    'thane': { area: 'thane', city: 'mumbai' },
    'navi mumbai': { area: 'navi mumbai', city: 'mumbai' },
    // Pune areas
    'kothrud': { area: 'kothrud', city: 'pune' },
    'wakad': { area: 'wakad', city: 'pune' },
    'hinjewadi': { area: 'hinjewadi', city: 'pune' },
    'baner': { area: 'baner', city: 'pune' },
    'hadapsar': { area: 'hadapsar', city: 'pune' },
    // Delhi areas
    'dwarka': { area: 'dwarka', city: 'delhi' },
    'saket': { area: 'saket', city: 'delhi' },
    'rohini': { area: 'rohini', city: 'delhi' },
    'lajpat nagar': { area: 'lajpat nagar', city: 'delhi' },
    // Cities (self-referencing)
    'mumbai': { area: null, city: 'mumbai' },
    'pune': { area: null, city: 'pune' },
    'delhi': { area: null, city: 'delhi' },
    'new delhi': { area: null, city: 'delhi' },
    'bangalore': { area: null, city: 'bangalore' },
    'bengaluru': { area: null, city: 'bangalore' },
    'hyderabad': { area: null, city: 'hyderabad' },
    'chennai': { area: null, city: 'chennai' },
    'kolkata': { area: null, city: 'kolkata' },
    'ahmedabad': { area: null, city: 'ahmedabad' },
    'jaipur': { area: null, city: 'jaipur' },
    'lucknow': { area: null, city: 'lucknow' },
    'gurgaon': { area: null, city: 'gurgaon' },
    'noida': { area: null, city: 'noida' },
    'bhopal': { area: null, city: 'bhopal' },
    'indore': { area: null, city: 'indore' },
    'nagpur': { area: null, city: 'nagpur' },
    'surat': { area: null, city: 'surat' },
    'vadodara': { area: null, city: 'vadodara' },
    'kochi': { area: null, city: 'kochi' },
    'chandigarh': { area: null, city: 'chandigarh' },
    'goa': { area: null, city: 'goa' },
};

export const detectIntent = async (query) => {
    const text = query.toLowerCase().trim();

    // ─────────────────────────────────────────────────────────────────
    // 1. WORKER SEARCH — Check if user mentions ANY skill keyword
    // ─────────────────────────────────────────────────────────────────
    const extractedSkill = extractSkill(text);
    const workerActionWords = ['find', 'need', 'hire', 'looking for', 'search', 'get me', 'show me', 'want', 'require', 'book'];
    const hasActionWord = workerActionWords.some(w => text.includes(w));

    // If skill is found (even without action word, e.g. just "electrician")
    if (extractedSkill) {
        const location = extractLocation(text);
        logger.info(`[Intent] find_worker | skill="${extractedSkill}" area="${location?.area}" city="${location?.city}"`);
        return {
            intent: 'find_worker',
            confidence: 0.95,
            entities: {
                skill: extractedSkill,
                area: location?.area || null,
                city: location?.city || null,
                rawQuery: text
            }
        };
    }

    // If action word + no skill → might still be worker search, ask LLM
    if (hasActionWord && !extractedSkill) {
        // Could be "find someone to fix my AC" — let LLM classify
        const llmResult = await classifyWithLLM(text);
        if (llmResult.intent === 'find_worker' && llmResult.skill) {
            const location = extractLocation(text);
            return {
                intent: 'find_worker',
                confidence: 0.75,
                entities: {
                    skill: llmResult.skill,
                    area: location?.area || null,
                    city: location?.city || null,
                    rawQuery: text
                }
            };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. PROJECT SEARCH
    // ─────────────────────────────────────────────────────────────────
    const projectKeywords = [
        'project', 'villa', 'apartment', 'house', 'luxur', 'commercial',
        'residential', 'flat', 'bungalow', 'penthouse', 'duplex',
        'township', 'plot', '3d model', 'ar view', 'property'
    ];
    if (projectKeywords.some(kw => text.includes(kw))) {
        return {
            intent: 'project_search',
            confidence: 0.85,
            entities: { query: text, ...extractProjectEntities(text) }
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. COST ESTIMATION
    // ─────────────────────────────────────────────────────────────────
    const costKeywords = [
        'cost', 'estimate', 'how much', 'price to build', 'construction price',
        'rate', 'budget', 'kharcha', 'kitna lagega', 'per sq', 'per square',
        'total cost', 'construction cost', 'building cost', 'renovation cost'
    ];
    if (costKeywords.some(kw => text.includes(kw))) {
        return {
            intent: 'cost_estimation',
            confidence: 0.9,
            entities: extractCostEntities(text)
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. MATERIAL SEARCH
    // ─────────────────────────────────────────────────────────────────
    const materialKeywords = [
        'material', 'cement', 'sand', 'steel', 'brick', 'tile', 'marble',
        'granite', 'wood', 'timber', 'glass', 'paint', 'pipe', 'wire',
        'aggregate', 'plywood', 'hardware', 'fitting', 'sanitary'
    ];
    if (materialKeywords.some(kw => text.includes(kw))) {
        return {
            intent: 'material_search',
            confidence: 0.85,
            entities: { query: text, name: extractMaterialName(text) }
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. JOB SEARCH
    // ─────────────────────────────────────────────────────────────────
    const jobKeywords = [
        'job', 'hiring', 'vacancy', 'opening', 'career', 'work available',
        'looking for work', 'need work', 'employment'
    ];
    if (jobKeywords.some(kw => text.includes(kw))) {
        return {
            intent: 'job_search',
            confidence: 0.85,
            entities: { query: text }
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. NAVIGATION
    // ─────────────────────────────────────────────────────────────────
    const navPatterns = [
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?(?:ar|augmented|3d)\s*(?:viewer|view)?/i, action: 'open_ar' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?job/i, action: 'navigate_jobs' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?profile/i, action: 'navigate_profile' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?message/i, action: 'navigate_messages' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?dashboard/i, action: 'navigate_dashboard' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?project/i, action: 'navigate_projects' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:the\s+)?director/i, action: 'navigate_directory' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?notification/i, action: 'navigate_notifications' },
        { pattern: /(?:open|go to|show|navigate to)\s+(?:my\s+)?payment/i, action: 'navigate_payments' },
    ];
    for (const { pattern, action } of navPatterns) {
        if (pattern.test(text)) {
            return { intent: 'navigation', confidence: 0.95, action, entities: {} };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 7. PLATFORM HELP
    // ─────────────────────────────────────────────────────────────────
    const helpKeywords = ['how to', 'help me', 'guide', 'what is infralink', 'how does', 'what can you do'];
    if (helpKeywords.some(kw => text.includes(kw))) {
        return { intent: 'platform_help', confidence: 0.8, entities: { query: text } };
    }

    // ─────────────────────────────────────────────────────────────────
    // 8. LLM FALLBACK
    // ─────────────────────────────────────────────────────────────────
    try {
        const llmResult = await classifyWithLLM(text);
        if (llmResult.intent === 'find_worker') {
            const location = extractLocation(text);
            return {
                intent: 'find_worker',
                confidence: 0.7,
                entities: {
                    skill: llmResult.skill || null,
                    area: location?.area || null,
                    city: location?.city || null,
                    rawQuery: text
                }
            };
        }
        return { intent: llmResult.intent || 'general', confidence: 0.6, entities: {} };
    } catch {
        return { intent: 'general', confidence: 0.5, entities: {} };
    }
};


// ══════════════════════════════════════════════════════════════════════════════
// ENTITY EXTRACTION (STRICT)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Extract EXACT skill from query. Returns the most specific match.
 * "interior contractor" wins over "contractor".
 * "electrician" returns "electrician" — NOT "contractor".
 */
function extractSkill(text) {
    // Check compound skills first (longer phrases)
    for (const skill of SKILL_DICTIONARY) {
        if (skill.includes(' ') && text.includes(skill)) {
            return skill;
        }
    }
    // Then single-word skills
    for (const skill of SKILL_DICTIONARY) {
        if (!skill.includes(' ') && text.includes(skill)) {
            return skill;
        }
    }
    return null;
}

/**
 * Extract location with area/city hierarchy.
 * "Andheri" → { area: "andheri", city: "mumbai" }
 * "Mumbai" → { area: null, city: "mumbai" }
 */
function extractLocation(text) {
    // Check areas first (more specific)
    for (const [key, value] of Object.entries(LOCATION_HIERARCHY)) {
        if (key.includes(' ')) {
            if (text.includes(key)) return value;
        }
    }
    for (const [key, value] of Object.entries(LOCATION_HIERARCHY)) {
        if (!key.includes(' ') && text.includes(key)) return value;
    }
    return null;
}

function extractProjectEntities(text) {
    const types = ['villa', 'apartment', 'house', 'commercial', 'residential', 'flat', 'bungalow'];
    const type = types.find(t => text.includes(t)) || null;
    const budgetMatch = text.match(/(\d+)\s*(?:lakh|lac|cr|crore)/i);
    return { type, budget: budgetMatch?.[0] || null };
}

function extractCostEntities(text) {
    const types = ['1bhk', '2bhk', '3bhk', '4bhk', 'villa', 'apartment', 'house', 'commercial', 'office'];
    const type = types.find(t => text.includes(t)) || null;
    const areaMatch = text.match(/(\d+)\s*(?:sq\.?ft|square\s*feet|sqft)/i);
    return { type, area: areaMatch ? parseInt(areaMatch[1]) : null, query: text };
}

function extractMaterialName(text) {
    const materials = ['cement', 'sand', 'steel', 'brick', 'tile', 'marble', 'granite', 'wood', 'timber', 'glass', 'paint', 'pipe', 'wire', 'plywood'];
    return materials.find(m => text.includes(m)) || null;
}

/**
 * LLM-based intent classification + skill extraction
 */
async function classifyWithLLM(query) {
    const { classifyIntent } = await import('./llmService.js');
    const intent = await classifyIntent(query);

    // Also try to extract a skill from the LLM response
    const lowerQuery = query.toLowerCase();
    const skill = extractSkill(lowerQuery);

    return { intent, skill };
}
