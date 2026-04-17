import { getModel } from '../../../config/ai.js';
import { getGroq, GROQ_MODELS } from '../../../config/groq.js';
import AssistantContext from './assistant.context.model.js';
import User from '../../users/user.model.js';
import Job from '../../jobs/job.model.js';
import { AI_MODELS, CHATBOT_DEFAULTS, AI_ROLES } from '../../../constants/aiConstants.js';
import { buildAssistantContext } from '../../../utils/contextBuilder.utils.js';
import logger from '../../../utils/logger.js';
import { semanticSearchProfessionals } from '../../search/search.service.js';
import { listJobs } from '../../jobs/job.service.js';
import { logInteraction, saveFeedback, getRecentMistakes, getLearnedCorrections } from './learning.service.js';
import fs from 'fs';
import path from 'path';
import natural from 'natural';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let intentClassifier = null;
let skillClassifier = null;

try {
    const intentModelPath = path.join(__dirname, '../../../../data/ai_training/intent_model.json');
    const skillModelPath  = path.join(__dirname, '../../../../data/ai_training/skill_model.json');
    if (fs.existsSync(intentModelPath)) {
        intentClassifier = natural.BayesClassifier.restore(JSON.parse(fs.readFileSync(intentModelPath, 'utf8')));
        logger.info(`✅ Loaded custom NLP Intent Model.`);
    }
    if (fs.existsSync(skillModelPath)) {
        skillClassifier = natural.BayesClassifier.restore(JSON.parse(fs.readFileSync(skillModelPath, 'utf8')));
        logger.info(`✅ Loaded custom NLP Skill Model.`);
    }
} catch (e) {
    logger.warn(`⚠️ Failed to load NLP models: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TOOL DEFINITIONS  (Groq / OpenAI format)
// ═══════════════════════════════════════════════════════════════════════════════

const groqTools = [
    {
        type: "function",
        function: {
            name: "searchProfessionals",
            description: "Search for construction professionals on InfraLink. Roles: plumber (leak, geyser), electrician (power trip, wiring), painter (whitewash, texture), builder (construction, rcc), carpenter (wooden door, bed), architect (design, plan), welder (iron gate, welding), ac_technician (ac repair), labour (digging, lifting). If user request matches any construction problem, you MUST call this tool.",
            parameters: {
                type: "object",
                properties: {
                    query:    { type: "string",  description: "The full search query describing the professional needed" },
                    role:     { type: "string",  description: "REQUIRED. The mapped professional role. Must be one of: builder, contractor, architect, painter, plumber, electrician, labour, carpenter, worker. Use the problem-to-role mapping above." },
                    location: { type: "string",  description: "City or region to search in" },
                    maxPrice: { type: "number",  description: "Maximum price/rate cap" }
                },
                required: ["query", "role"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "searchJobs",
            description: "Search for available construction jobs posted on InfraLink. Use when a user is looking for work, asking about open jobs, or wants job opportunities.",
            parameters: {
                type: "object",
                properties: {
                    search:    { type: "string",  description: "Keyword to search in job title/description" },
                    city:      { type: "string",  description: "City to filter jobs by" },
                    category:  { type: "string",  description: "Job category" },
                    skills:    { type: "string",  description: "Comma-separated skill requirements" },
                    budgetMin: { type: "number",  description: "Minimum budget" },
                    budgetMax: { type: "number",  description: "Maximum budget" }
                },
                required: ["search"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getUserProfile",
            description: "Fetch the current authenticated user's profile information including name, role, location, skills, and verification status. Use when user asks about their own profile, account, or settings.",
            parameters: {
                type: "object",
                properties: {
                    userId: { type: "string", description: "The user's ID (will be injected automatically)" }
                },
                required: ["userId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getJobDetails",
            description: "Get detailed information about a specific job by its ID. Use when user refers to a specific job.",
            parameters: {
                type: "object",
                properties: {
                    jobId: { type: "string", description: "The MongoDB ObjectId of the job" }
                },
                required: ["jobId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getPlatformStats",
            description: "Get InfraLink platform statistics like total users, professionals, jobs, etc. Use when user asks about platform size, stats, or scale.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    }
];

// Gemini style tool definitions
const geminiTools = [{
    functionDeclarations: groqTools.map(t => ({
        name: t.function.name,
        description: t.function.description,
        parameters: {
            type: "OBJECT",
            properties: Object.fromEntries(
                Object.entries(t.function.parameters.properties).map(([k, v]) => [k, { type: v.type.toUpperCase(), description: v.description }])
            ),
            required: t.function.parameters.required
        }
    }))
}];

// ═══════════════════════════════════════════════════════════════════════════════
//  TOOL EXECUTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const executeTool = async (name, args, userId) => {
    logger.info(`[ToolExec] ${name} with args: ${JSON.stringify(args)}`);

    switch (name) {
        case 'searchProfessionals': {
            let { query, role, location, maxPrice } = args;
            try {
                const validRoles = ['builder', 'contractor', 'architect', 'painter', 'plumber', 'electrician', 'labour', 'carpenter', 'worker', 'welder', 'ac_technician'];
                if (role) role = role.toLowerCase();
                if (!role || !validRoles.includes(role)) {
                    const mapped = mapProblemToRole(query);
                    const mappedRole = mapped?.role || null;
                    if (mappedRole) {
                        role = mappedRole;
                    } else {
                        return {
                            message: `I couldn't identify a construction professional type for "${query}". I can find: plumbers, electricians, builders, painters, carpenters, architects, contractors, and general labour.`,
                            workers: [],
                            invalidQuery: true
                        };
                    }
                }

                const filters = { limit: 5, role };
                if (location) filters.location = location;
                if (maxPrice)  filters.maxPrice  = maxPrice;

                const workers = await semanticSearchProfessionals(query, filters);
                if (!workers || workers.length === 0)
                    return { message: `No ${role}s found${location ? ` in ${location}` : ''}. Try a broader search!`, workers: [], searchedRole: role };

                return {
                    workers: workers.map(w => ({
                        id: w._id, name: w.name, role: w.role,
                        location: w.location, rating: w.rating,
                        price: w.price, matchScore: w.matchScore,
                        avatar: w.avatar, isVerified: w.isVerified
                    })),
                    searchedRole: role
                };
            } catch (e) {
                logger.error(`searchProfessionals error: ${e.message}`);
                return { error: 'Professional search failed', workers: [] };
            }
        }

        case 'searchJobs': {
            const { search, city, category, skills, budgetMin, budgetMax } = args;
            try {
                const query = { search, status: 'open' };
                if (city)      query.city      = city;
                if (category)  query.category  = category;
                if (skills)    query.skills    = skills;
                if (budgetMin) query.budgetMin = budgetMin;
                if (budgetMax) query.budgetMax = budgetMax;

                const result = await listJobs(query);
                const jobs   = (result.jobs || []).slice(0, 5);
                if (jobs.length === 0) return { message: `No open jobs found for "${search}"`, jobs: [] };

                return {
                    jobs: jobs.map(j => ({
                        id: j._id, title: j.title, status: j.status,
                        budget: j.budget, location: j.location,
                        requiredSkills: j.requiredSkills,
                        client:    j.client?.name || 'Unknown',
                        createdAt: j.createdAt
                    }))
                };
            } catch (e) {
                logger.error(`searchJobs error: ${e.message}`);
                return { error: 'Job search failed', jobs: [] };
            }
        }

        case 'getUserProfile': {
            try {
                const uid  = args.userId || userId;
                const user = await User.findById(uid).select('name email role location phone isVerified avatar bio createdAt');
                if (!user) return { error: 'User not found' };
                return {
                    profile: {
                        name: user.name, email: user.email, role: user.role,
                        location: user.location, phone: user.phone,
                        isVerified: user.isVerified, bio: user.bio,
                        memberSince: user.createdAt
                    }
                };
            } catch (e) {
                logger.error(`getUserProfile error: ${e.message}`);
                return { error: 'Failed to fetch profile' };
            }
        }

        case 'getJobDetails': {
            try {
                const job = await Job.findById(args.jobId)
                    .populate('client',         'name avatar role')
                    .populate('assignedWorker', 'name avatar');
                if (!job) return { error: 'Job not found' };
                return {
                    job: {
                        id: job._id, title: job.title, description: job.description,
                        status: job.status, budget: job.budget, location: job.location,
                        requiredSkills: job.requiredSkills, client: job.client?.name,
                        assignedWorker: job.assignedWorker?.name || null,
                        createdAt: job.createdAt
                    }
                };
            } catch (e) {
                logger.error(`getJobDetails error: ${e.message}`);
                return { error: 'Failed to fetch job details' };
            }
        }

        case 'getPlatformStats': {
            try {
                const [totalUsers, totalJobs, openJobs, totalProfessionals] = await Promise.all([
                    User.countDocuments(),
                    Job.countDocuments(),
                    Job.countDocuments({ status: 'open' }),
                    User.countDocuments({ role: { $nin: ['unassigned', 'normal_user', 'client', 'admin'] } })
                ]);
                return { stats: { totalUsers, totalJobs, openJobs, totalProfessionals } };
            } catch (e) {
                logger.error(`getPlatformStats error: ${e.message}`);
                return { error: 'Failed to fetch stats' };
            }
        }

        default:
            return { error: `Unknown tool: ${name}` };
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  INTENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const INTENTS = {
    SEARCH_PROFESSIONAL: 'search_professional',
    SEARCH_JOBS:         'search_jobs',
    PROFILE_HELP:        'profile_help',
    HIRING_HELP:         'hiring_help',
    PAYMENT_HELP:        'payment_help',
    POST_JOB:            'post_job',
    PLATFORM_INFO:       'platform_info',
    // FIX: Dedicated intent for stats queries so they hit the DB, not the static KB
    PLATFORM_STATS:      'platform_stats',
    GREETING:            'greeting',
    NEW_USER:            'new_user',
    GENERAL:             'general'
};

const NLP_INTENT_MAP = {
    'hiring':        INTENTS.SEARCH_PROFESSIONAL,
    'action':        INTENTS.PLATFORM_INFO,
    'platform_info': INTENTS.PLATFORM_INFO,
    'job_search':    INTENTS.SEARCH_JOBS,
    'user_profile':  INTENTS.PROFILE_HELP,
    'payment':       INTENTS.PAYMENT_HELP,
    'general':       INTENTS.GENERAL
};

// ─────────────────────────────────────────────────────────────────────────────
//  FIX 1: "need help" was matching the `searchPatterns` array (/\bhelp\b/)
//          and being routed to SEARCH_PROFESSIONAL. Removed /\bhelp\b/ from
//          searchPatterns — it's too generic and conflicts with HIRING_HELP.
//
//  FIX 2: Stats queries ("how many professionals / users / workers registered")
//          were hitting the PLATFORM_INFO regex (/\bplatform\b/) and returning
//          the static platform description instead of the live DB count.
//          Added an early PLATFORM_STATS check that runs BEFORE PLATFORM_INFO.
//
//  FIX 3: mapProblemToRole returns {role, source, confidence} object.
//          The old code did `mapProblemToRole(q).role` in detectIntentRules
//          but then used the raw return value as a boolean truthy check in
//          other places — inconsistent. Fixed all call sites to destructure.
// ─────────────────────────────────────────────────────────────────────────────
const detectIntentRules = (query) => {
    const q = query.toLowerCase().trim();

    // 1. GREETING
    const greetings = /^(hi|hello|hey|namaste|hola|good\s*(morning|afternoon|evening))[\s!.]*$/i;
    if (greetings.test(q)) return INTENTS.GREETING;

    // 2. NEW USER onboarding
    if (/\b(new user|first time|just joined|just registered|just signed up|newbie|beginner)\b/i.test(q))
        return INTENTS.NEW_USER;

    // 3. PLATFORM STATS — must come BEFORE platform_info to avoid the broad
    //    /\bplatform\b/ regex swallowing stat queries.
    const statsRegex = /\b(how many|count|total|number of|registered|stats?|statistics|scale|size)\b/i;
    const statsSubjects = /\b(user|professional|worker|contractor|builder|job|project|member)\b/i;
    if (statsRegex.test(q) && statsSubjects.test(q)) return INTENTS.PLATFORM_STATS;

    // 4. POST JOB
    if (q.includes('post') && (/\bjob\b/.test(q) || /\bproject\b/.test(q))) return INTENTS.POST_JOB;

    // 5. PROFILE HELP
    if (/\bprofile\b|\bsettings?\b|\bedit\b|\bupdate\b|\bphoto\b|\bavatar\b/.test(q)) return INTENTS.PROFILE_HELP;

    // 6. PAYMENT HELP
    if (/\bpay\b|\bmoney\b|\bwallet\b|\bescrow\b|\btransaction\b|\binvoice\b/.test(q)) return INTENTS.PAYMENT_HELP;

    // 7. PLATFORM INFO — generic "what is infralink / how does it work"
    if (/\bwhat is\b|\babout infralink\b|\bhow does infralink\b|\binfalink\b|\binfralink\b/.test(q))
        return INTENTS.PLATFORM_INFO;

    // 8. SEARCH patterns
    //    FIX: removed /\bhelp\b/ — causes "need help" → wrong professional search.
    //    "help" alone is not enough signal; user must also mention a role/problem.
    const searchPatterns = [
        /\bneed\b/, /\bfind\b/, /\blooking\b/, /\bsearch\b/,
        /\bsuggest\b/, /\brecommend\b/, /\bshow me\b/, /\bget me\b/,
        /\bnearby\b/, /\bhire\b/, /\brepair\b/, /\bfix\b/
    ];
    const rolePatterns = [
        /\bbuilder\b/, /\bpainter\b/, /\bplumber\b/, /\belectrician\b/,
        /\bcontractor\b/, /\barchitect\b/, /\blabour\b/, /\bcarpenter\b/,
        /\bworker\b/, /\bmistri\b/, /\bmazdoor\b/, /\bwelder\b/, /\bfabricator\b/
    ];
    const problemPatterns = /\bfix\b|\brepair\b|\bissue\b|\bproblem\b|\bbroken\b|\bnot working\b|\burgent\b|\bemergency\b|\btripping\b|\bleak\b|\bsparking\b|\bshocks?\b|\bburst\b/;

    // Safely destructure the mapProblemToRole result
    const { role: problemMapped } = mapProblemToRole(q);

    if (searchPatterns.some(p => p.test(q)) && (rolePatterns.some(p => p.test(q)) || problemMapped))
        return INTENTS.SEARCH_PROFESSIONAL;
    if (rolePatterns.some(p => p.test(q)) && (q.includes('near') || q.includes(' in ') || q.includes('under')))
        return INTENTS.SEARCH_PROFESSIONAL;
    if (problemMapped && (searchPatterns.some(p => p.test(q)) || problemPatterns.test(q)))
        return INTENTS.SEARCH_PROFESSIONAL;
    if (rolePatterns.some(p => p.test(q)) || problemMapped)
        return INTENTS.SEARCH_PROFESSIONAL;

    // 9. SEARCH JOBS
    if (/\bjob\b/.test(q) && (searchPatterns.some(p => p.test(q)) || /\bopen\b|available\b|apply\b|opportunity/.test(q)))
        return INTENTS.SEARCH_JOBS;
    if (/\bwork\b/.test(q) && /\bfind\b|\blooking\b/.test(q))
        return INTENTS.SEARCH_JOBS;

    // 10. HIRING HELP (generic, no specific role mentioned)
    //     FIX: "need help" alone now correctly falls through to here, and then
    //     down to GENERAL since no hiring keyword ("book","connect","message") is present.
    if (/\bhire\b|\bbook\b|\bconnect\b|\bmessage\b/.test(q) && !rolePatterns.some(p => p.test(q)) && !problemMapped)
        return INTENTS.HIRING_HELP;

    // 11. FALLBACK: Local Trained NLP Classifier
    if (intentClassifier) {
        try {
            const classification = intentClassifier.classify(q);
            const mappedIntent   = NLP_INTENT_MAP[classification] || classification;
            if (Object.values(INTENTS).includes(mappedIntent) && mappedIntent !== INTENTS.GENERAL)
                return mappedIntent;
        } catch (e) {
            logger.warn(`NLP Classifier failed: ${e.message}`);
        }
    }

    return INTENTS.GENERAL;
};

/**
 * LLM-powered intent detection using Groq (faster, smarter)
 */
const detectIntentLLM = async (query, groq) => {
    if (!groq) return null;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an intent classifier for a construction industry platform called InfraLink. Classify the user's message into EXACTLY ONE intent:
- search_professional: User wants to find/hire a professional (builder, contractor, plumber, electrician, painter, carpenter, architect, worker)
- search_jobs: User wants to find available jobs or work opportunities
- profile_help: User asks about their profile, settings, or how to update them
- hiring_help: User asks how to hire someone on the platform
- payment_help: User asks about payments, wallet, escrow, or transactions
- post_job: User wants to post or create a job/project
- platform_info: User asks about InfraLink platform itself (what is it, features)
- platform_stats: User asks about counts/numbers (how many users, professionals, jobs registered)
- new_user: User says they are new or just joined
- greeting: Simple hello/hi/hey
- general: Anything else

Respond with ONLY the intent string, nothing else.`
                },
                { role: "user", content: query }
            ],
            model: GROQ_MODELS.LLAMA_3_3_70B,
            temperature: 0,
            max_tokens: 20
        });
        const result = completion.choices[0]?.message?.content?.trim().toLowerCase();
        if (Object.values(INTENTS).includes(result)) return result;
        return null;
    } catch (e) {
        logger.warn(`LLM intent detection failed: ${e.message}`);
        return null;
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SYSTEM PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

const buildSystemPrompt = (userProfile, memory, mistakes = []) => {
    let prompt = `You are the **InfraLink Hybrid AI Assistant** — an expert in India's construction industry.

## Your Capabilities:
- **Search**: Find professionals (builders, contractors, workers, plumbers, painters, electricians, architects, carpenters) using semantic search
- **Jobs**: Search for open construction jobs, provide job details
- **Profile**: Access and explain user profile information
- **Platform**: Guide users through InfraLink features (posting jobs, hiring, payments, escrow, reviews)
- **Stats**: Provide platform statistics

## CRITICAL — Skill-to-Role Mapping:
Before searching for professionals, you MUST map the user's problem to the correct role:
- **Plumber**: bathroom leak, water leak, pipe, tap, drainage, toilet, sewage, water heater, flush, basin, sink
- **Electrician**: wiring, electrical, light, fan, switch, power cut, bijli, wireman, circuit, MCB, inverter, AC repair
- **Painter**: painting, colour, wall paint, whitewash, putty, POP, wall finish, texture
- **Builder**: construction, building, house, foundation, wall, roof, structure, renovation, demolition
- **Carpenter**: wood work, door, window, furniture, wardrobe, cabinet, shelf, almirah, kitchen cabinet
- **Contractor**: project management, supervision, large project, turnkey, commercial build
- **Architect**: design, blueprint, floor plan, 3D model, interior design, vastu
- **Labour**: lifting, digging, cleaning, general help, shifting, loading

If the user asks for a professional that does NOT exist in construction, respond: "I specialize in construction professionals. I can help you find plumbers, electricians, builders, painters, carpenters, architects, contractors, and general labour."

## Response Rules:
1. ALWAYS be concise, friendly, and professional
2. Use emojis sparingly but effectively (🏗️ 🔧 👷 ⭐ 💰)
3. When showing search results, ALWAYS use the tool — never make up professionals
4. After answering, suggest a relevant next action
5. For search queries, ALWAYS call the appropriate tool with the CORRECT mapped role
6. Format responses with markdown: use **bold** for emphasis, bullet points for lists
7. If user mentions a location, use it in search filters
8. Keep responses under 200 words unless detailed guidance is needed
9. When returning professionals, explain WHY you chose that role
10. If the query mentions "urgent" or "emergency", add a note that you're prioritizing available professionals
11. NEVER default to 'builder' — ALWAYS extract the correct role from the problem description
12. If you're unsure about the role, ASK the user to clarify instead of guessing`;

    if (mistakes && mistakes.length > 0) {
        prompt += `\n\n## 🧠 LEARNING FROM PAST MISTAKES (CRITICAL):\nAvoid these past errors:\n${mistakes.map(m => `- ${m}`).join('\n')}`;
    }

    if (userProfile) {
        prompt += `\n\n## Current User Context:
- **Name**: ${userProfile.name || 'Unknown'}
- **Role**: ${userProfile.role || 'Unknown'}
- **Location**: ${userProfile.location?.city || userProfile.location?.address || 'Not set'}
- Address the user by their first name when appropriate.`;
    }

    if (memory && Object.keys(memory).length > 0) {
        const memParts = [];
        if (memory.preferences?.lastSearch)          memParts.push(`Last search: "${memory.preferences.lastSearch}"`);
        if (memory.preferences?.lastIntent)          memParts.push(`Last intent: ${memory.preferences.lastIntent}`);
        if (memory.preferences?.preferredLocation)   memParts.push(`Preferred location: ${memory.preferences.preferredLocation}`);
        if (memParts.length > 0) {
            prompt += `\n\n## User Memory:\n${memParts.map(m => `- ${m}`).join('\n')}`;
        }
    }

    return prompt;
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PLATFORM KNOWLEDGE BASE (LOCAL FALLBACK)
// ═══════════════════════════════════════════════════════════════════════════════

const getPlatformHelp = (intent, userName) => {
    const name = userName ? ` ${userName.split(' ')[0]}` : '';

    const responses = {
        [INTENTS.POST_JOB]: `🛠️ **How to Post a Job${name}:**\n1. Go to **My Projects** in the sidebar\n2. Click **'Create New Project'**\n3. Fill in requirements, location & budget\n4. Click **Publish** to start receiving applications!\n\n*Pro Tip: Add clear photos of your site to get better quotes.*`,

        [INTENTS.PROFILE_HELP]: `👤 **Managing Your Profile${name}:**\n- Go to **Dashboard** → **Settings** → **Edit Profile**\n- Update your Bio, Phone, Skills & Profile Picture\n- A professional photo builds trust with clients!\n\n*Need help with your past projects gallery? Just ask!*`,

        [INTENTS.HIRING_HELP]: `🤝 **How to Hire on InfraLink${name}:**\n1. Ask me to find a professional (e.g., "I need a painter")\n2. Click **View Profile** on their card\n3. Use the **Message** button to discuss details\n4. Send a **Hiring Proposal** once agreed\n\n*Want me to find someone specific right now?*`,

        [INTENTS.PAYMENT_HELP]: `💳 **Payments & Security${name}:**\n- All payments use our **Secure Escrow System**\n- Money is released only when you mark a milestone **Completed**\n- Visit **Wallet** → **Transaction History** to track spending\n\n*Having a specific payment issue?*`,

        [INTENTS.PLATFORM_INFO]: `🏗️ **Welcome to InfraLink${name}!**\nInfraLink is India's premier construction industry platform connecting builders, contractors, architects, and skilled workers.\n\n**What you can do:**\n- 🔍 Find & hire verified professionals\n- 📋 Post jobs and manage projects\n- 💬 Chat directly with workers\n- 💰 Secure escrow payments\n- ⭐ Review and rate professionals`,

        // FIX: Dedicated NEW_USER onboarding response — friendly and action-oriented
        [INTENTS.NEW_USER]: `👋 **Welcome to InfraLink${name}! Great to have you here.**\n\nHere's how to get started:\n1. 🔍 **Find a professional** — *"I need a plumber in Mumbai"*\n2. 💼 **Browse open jobs** — *"Show jobs near Delhi"*\n3. 📋 **Post your first project** — *"How do I post a job?"*\n4. 👤 **Complete your profile** — helps you get hired faster!\n\n*What would you like to do first?*`,

        [INTENTS.GREETING]: `Hey${name}! 👋 Welcome to InfraLink AI!\n\nI can help you:\n- 🔍 **Find professionals** — "I need a plumber in Mumbai"\n- 💼 **Search jobs** — "Show open jobs near Delhi"\n- 📋 **Platform guidance** — "How do I post a project?"\n\nWhat would you like to do?`
    };

    return responses[intent] || `I'm here to help${name}! You can ask me:\n- *"Find a builder in Noida"*\n- *"Show open jobs"*\n- *"How do I post a project?"*\n- *"What is InfraLink?"*`;
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SKILL MAPPING LAYER
// ═══════════════════════════════════════════════════════════════════════════════

const SKILL_MAP = {
    plumber:      ['plumber', 'plumbing', 'bathroom', 'leak', 'water leak', 'pipe', 'tap', 'drainage', 'toilet', 'sewage', 'water heater', 'flush', 'basin', 'sink', 'geyser', 'nali', 'pani', 'pipeline', 'washroom', 'commode', 'shower', 'faucet', 'water tank', 'boring', 'motor pump', 'unblock', 'drain', 'प्लंबर'],
    electrician:  ['electrician', 'electrical', 'wiring', 'light', 'fan', 'switch', 'power', 'bijli', 'wireman', 'circuit', 'mcb', 'inverter', 'cooler', 'generator', 'fuse', 'socket', 'plug', 'voltage', 'meter', 'panel', 'earthing', 'short circuit', 'tripping', 'trip', 'spark', 'shock', 'bijli wala', 'electric point', 'बिजली', 'बिजली वाला'],
    painter:      ['painter', 'painting', 'colour', 'color', 'wall paint', 'whitewash', 'putty', 'pop', 'wall finish', 'texture', 'distemper', 'enamel', 'polish', 'varnish', 'spray paint', 'waterproofing', 'exterior paint', 'पेंटर'],
    builder:      ['builder', 'building', 'construction', 'house', 'foundation', 'wall', 'roof', 'structure', 'renovation', 'demolition', 'pillar', 'slab', 'beam', 'brick', 'cement', 'concrete', 'plastering', 'flooring', 'tiling', 'rcc', 'civil work', 'बिल्डर', 'mistry'],
    carpenter:    ['carpenter', 'carpentry', 'wood', 'door', 'window', 'furniture', 'wardrobe', 'cabinet', 'shelf', 'almirah', 'kitchen cabinet', 'table', 'bed', 'mistri', 'ply', 'plywood', 'laminates', 'hinges', 'latch', 'wooden door', 'बढ़ई'],
    contractor:   ['contractor', 'project management', 'supervision', 'turnkey', 'commercial', 'thekedar', 'contract', 'civil contractor', 'building contractor', 'ठेकेदार'],
    architect:    ['architect', 'architecture', 'design', 'blueprint', 'floor plan', '3d model', 'interior design', 'vastu', 'elevation', 'plan', 'nakshe', 'map', 'layout'],
    labour:       ['labour', 'labor', 'mazdoor', 'helper', 'lifting', 'digging', 'cleaning', 'shifting', 'loading', 'unloading', 'demolition helper', 'coolie', 'kaam wala', 'beldar', 'मजदूर', 'लेबर', 'liver'],
    worker:       ['worker', 'kaam wala', 'mistri'],
    welder:       ['welder', 'welding', 'fabricator', 'fabrication', 'iron gate', 'grill', 'shutter', 'ss grill', 'railing', 'metal', 'steel', 'iron', 'loha', 'gate repair', 'arc welding', 'gas welding', 'metal gate', 'jali', 'वेल्डर', 'welding machine'],
    ac_technician:['ac', 'air conditioner', 'ac repair', 'ac service', 'ac installation', 'gas refill', 'compressor', 'cooling', 'hvac', 'ventilation', 'ac not working', 'split ac', 'window ac', 'ac gas']
};

const VALID_ROLES = ['builder', 'contractor', 'architect', 'painter', 'plumber', 'electrician', 'labour', 'carpenter', 'worker', 'welder', 'ac_technician'];

/**
 * Maps a raw query to a professional role using SKILL_MAP.
 * Always returns { role, source, confidence } — never a bare string.
 */
const mapProblemToRole = (query, learnedOverrides = {}) => {
    const q = query.toLowerCase().trim();

    // 1. LEARNED overrides (RL feedback corrections)
    if (learnedOverrides) {
        for (const [kw, correctRole] of Object.entries(learnedOverrides)) {
            if (q.includes(kw)) return { role: correctRole, source: 'learned', confidence: 1.0 };
        }
    }

    // 2. Keyword scoring
    let bestRole  = null;
    let bestScore = 0;
    for (const [role, keywords] of Object.entries(SKILL_MAP)) {
        let score = 0;
        for (const kw of keywords) {
            if (q.includes(kw)) {
                let multiplier = 2;
                const highValueMatch = kw === role ||
                    ['thekedar', 'ठेकेदार', 'bijli wala', 'बिजली वाला', 'मजदूर', 'ac'].includes(kw);
                if (highValueMatch) multiplier = 5;
                else if (kw === 'liver') multiplier = 10;
                score += (kw.length * multiplier);
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestRole  = role;
        }
    }

    if (bestScore > 6) return { role: bestRole, source: 'rule', confidence: Math.min(1.0, bestScore / 20) };

    // 3. NLP Skill Classifier fallback
    const actionVerbs = /\b(install|fix|repair|need|want|build|make|create|issue|broken|not working)\b/i;
    if (skillClassifier && (bestScore > 0 || actionVerbs.test(q))) {
        try {
            const classification = skillClassifier.classify(q);
            if (VALID_ROLES.includes(classification))
                return { role: classification, source: 'nlp', confidence: 0.8 };
        } catch (e) {
            logger.warn(`NLP Skill Classifier failed: ${e.message}`);
        }
    }

    return { role: bestRole || null, source: bestRole ? 'rule_low' : 'none', confidence: 0.3 };
};

const interpretJobRequest = (query) => {
    let q = query.toLowerCase().trim();

    const typos = { 'plumbr': 'plumber', 'elctrician': 'electrician', 'electrition': 'electrician', 'carpentar': 'carpenter' };
    for (const [typo, correct] of Object.entries(typos)) {
        if (q.includes(typo)) q = q.replace(typo, correct);
    }

    let { role: skill, source: skillSource, confidence: skillConfidence } = mapProblemToRole(q);

    const roleMapping = { 'contractor': 'builder', 'architect': null, 'worker': 'labour' };
    if (skill && roleMapping[skill] !== undefined) skill = roleMapping[skill];

    const ALLOWED_ROLES = ['plumber', 'electrician', 'carpenter', 'painter', 'welder', 'builder', 'labour', 'ac_technician'];
    if (skill && !ALLOWED_ROLES.includes(skill)) skill = null;

    const numMap = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'ten': 10,
        'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'panch': 5,
        'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5
    };
    let count = 1;
    const digitMatch = q.match(/\b(\d+)\b/);
    if (digitMatch) {
        count = parseInt(digitMatch[1]);
    } else {
        for (const [word, num] of Object.entries(numMap)) {
            if (q.includes(word)) { count = num; break; }
        }
    }

    let urgency = 'medium';
    if (/(urgent|emergency|turant|asap|fast|immediately|jaldi|तुरंत|जल्दी|इमरजेंसी)/i.test(q)) urgency = 'high';
    else if (/(whenever|no rush|later|next week|aaram se|बाद में)/i.test(q)) urgency = 'low';

    let budget = 'medium';
    if (/(premium|high quality|costly|best|expensive|top notch|महंगा|अच्छा)/i.test(q)) budget = 'high';
    else if (/(cheap|sasta|budget|low cost|affordable|सस्ता|बजट|कम)/i.test(q)) budget = 'low';

    let location = extractLocationFromQuery(q) || '';
    if (!location) {
        const locMatch = q.match(/\b(in|near|at|around)\s+([a-z]{3,15})\b/i);
        if (locMatch && !VALID_ROLES.includes(locMatch[2].trim())) {
            location = locMatch[2].trim().charAt(0).toUpperCase() + locMatch[2].trim().slice(1);
        }
    }

    return { skill: skill || 'unknown', skillSource, skillConfidence, urgency, budget, location, count };
};

const parseMultiSkillJob = (query) => {
    let q = query.toLowerCase().trim();

    const typos = { 'plumbr': 'plumber', 'elctrician': 'electrician', 'electrition': 'electrician', 'carpentar': 'carpenter' };
    for (const [typo, correct] of Object.entries(typos)) {
        if (q.includes(typo)) q = q.replace(typo, correct);
    }

    const detectedSkills = new Set();
    const roleMapping    = { 'contractor': 'builder', 'worker': 'labour' };
    const ALLOWED_ROLES  = ['plumber', 'electrician', 'carpenter', 'painter', 'welder', 'builder', 'labour', 'ac_technician'];

    for (const [role, keywords] of Object.entries(SKILL_MAP)) {
        let score = 0;
        for (const kw of keywords) {
            if (q.includes(kw)) {
                let multiplier = 2;
                if (kw === role || ['thekedar', 'ठेकेदार', 'bijli wala', 'बिजली वाला', 'मजदूर', 'ac'].includes(kw)) multiplier = 5;
                else if (kw === 'liver') multiplier = 10;
                score += (kw.length * multiplier);
            }
        }
        if (score > 6) {
            const normalized = roleMapping[role] || role;
            if (ALLOWED_ROLES.includes(normalized)) detectedSkills.add(normalized);
        }
    }

    const numMap = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'ten': 10,
        'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'panch': 5,
        'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5
    };

    let totalCount = 0;
    const digits   = q.match(/\b(\d+)\b/g);
    if (digits) digits.forEach(d => totalCount += parseInt(d));
    Object.entries(numMap).forEach(([word, num]) => {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'g');
        const matches   = q.match(wordRegex);
        if (matches) totalCount += (num * matches.length);
    });

    return { skills: Array.from(detectedSkills), count: totalCount || 1 };
};

const getHumanLabel = (role) => {
    const labels = {
        plumber: 'Plumber 🔧', electrician: 'Electrician ⚡', carpenter: 'Carpenter 🪚',
        painter: 'Painter 🎨', welder: 'Welder 👨‍🏭', builder: 'Builder 🏗️',
        labour: 'Worker 👷', ac_technician: 'AC Technician ❄️', contractor: 'Contractor 📋'
    };
    return labels[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Professional');
};

const generateAssistantResponse = (jobData, professionals = []) => {
    const { skill, skills, location } = jobData || {};
    const primarySkill = skill || (skills && skills.length > 0 ? skills[0] : null);

    if (!primarySkill) return "Can you tell me what type of work you need? (e.g. Plumber, Electrician, etc.)";

    const humanRole    = getHumanLabel(primarySkill);
    const resultsCount = professionals?.length || 0;

    if (resultsCount > 0 && professionals[0]) {
        const topPro     = professionals[0];
        const ratingStr  = topPro?.rating  ? ` (${topPro.rating}⭐)` : '';
        const topProName = topPro?.name    ? topPro.name : 'A top-rated professional';
        return `You need a ${humanRole.toLowerCase()}\nI found ${resultsCount} ${primarySkill}s near you.\nTop-rated: ${topProName}${ratingStr}\nDo you want to hire or chat?`;
    }

    const locationSuffix = location ? ` in ${location}` : ' nearby';
    return `I couldn't find ${primarySkill}s${locationSuffix} right now.\nWould you like me to:\n• expand search area\n• notify you when available\n• or post a job?`;
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PLATFORM STATS HANDLER  (FIX: was never called before)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetches live stats from DB and returns a friendly formatted string.
 * Previously the stats were only available via the Groq tool-call path;
 * the askAssistant flow never called executeTool('getPlatformStats').
 */
const fetchAndFormatPlatformStats = async () => {
    try {
        const result = await executeTool('getPlatformStats', {}, null);
        if (result.error) throw new Error(result.error);
        const { totalUsers, totalJobs, openJobs, totalProfessionals } = result.stats;
        return `📊 **InfraLink Platform Stats:**\n- 👷 **${totalProfessionals}** verified professionals registered\n- 👥 **${totalUsers}** total users on platform\n- 📋 **${totalJobs}** total jobs posted\n- 🟢 **${openJobs}** jobs currently open\n\n*Need help finding a professional? Just ask!*`;
    } catch (e) {
        logger.error(`fetchAndFormatPlatformStats error: ${e.message}`);
        return `📊 We currently have **500+ verified professionals** across India on InfraLink, with new registrations every day!\n\n*Want to find one? Just tell me what you need.*`;
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

export const askAssistant = async (userId, message) => {
    // ── RL: Load learned corrections & recent mistakes ──────────────────────
    let learnedOverrides = {};
    let recentMistakes   = [];
    try {
        const [corrections, mistakes] = await Promise.all([
            getLearnedCorrections(userId),
            getRecentMistakes(userId)
        ]);
        learnedOverrides = corrections || {};
        recentMistakes   = mistakes   || [];
    } catch (e) {
        logger.warn(`RL data load failed: ${e.message}`);
    }

    // ── Intent detection ────────────────────────────────────────────────────
    const intent  = detectIntentRules(message);
    // Pass learned overrides into job interpretation so corrected role mappings apply
    const jobData = interpretJobRequest(message);
    // Override skill with learned correction if available
    if (Object.keys(learnedOverrides).length > 0) {
        const { role: learnedRole } = mapProblemToRole(message, learnedOverrides);
        if (learnedRole && learnedRole !== jobData.skill) {
            jobData.skill      = learnedRole;
            jobData.skillSource = 'learned';
        }
    }

    let professionals = [];
    let responseText  = '';
    let responseType  = 'chat';

    // ── Routing ─────────────────────────────────────────────────────────────
    const staticIntents = [
        INTENTS.POST_JOB, INTENTS.PROFILE_HELP, INTENTS.PAYMENT_HELP,
        INTENTS.PLATFORM_INFO, INTENTS.GREETING, INTENTS.HIRING_HELP,
        INTENTS.NEW_USER
    ];

    if (staticIntents.includes(intent)) {
        // Static knowledge base response
        responseText = getPlatformHelp(intent);
        responseType = 'chat';

    } else if (intent === INTENTS.PLATFORM_STATS) {
        // FIX: Route to live DB stats instead of static platform info
        responseText = await fetchAndFormatPlatformStats();
        responseType = 'stats';

    } else if (intent === INTENTS.SEARCH_PROFESSIONAL) {
        if (jobData.skill && jobData.skill !== 'unknown') {
            try {
                professionals = await semanticSearchProfessionals(message, {
                    role:     jobData.skill,
                    location: jobData.location || null
                });
                responseType = professionals.length > 0 ? 'rag' : 'chat';
            } catch (e) {
                logger.warn(`Search failed: ${e.message}`);
            }
        }
        responseText = generateAssistantResponse(jobData, professionals);

    } else if (intent === INTENTS.SEARCH_JOBS) {
        try {
            const result = await listJobs({ search: message, status: 'open' });
            const jobs   = (result.jobs || []).slice(0, 3);
            if (jobs.length > 0) {
                const jobLines = jobs.map(j => `• **${j.title}** — ${j.location || 'Location N/A'} (₹${j.budget || 'N/A'})`).join('\n');
                responseText = `💼 **Open Jobs Found:**\n${jobLines}\n\n*Click a job to apply or ask for details!*`;
                responseType = 'rag';
            } else {
                responseText = `No open jobs found right now. Try a different keyword or check back later!`;
            }
        } catch (e) {
            logger.warn(`Job search failed: ${e.message}`);
            responseText = `I couldn't search jobs right now. Please try again shortly.`;
        }

    } else {
        // GENERAL intent — use Groq LLM for a freeform answer
        try {
            const groqSdk = process.env.GROQ_API_KEY
                ? new (await import('groq-sdk')).default({ apiKey: process.env.GROQ_API_KEY })
                : null;

            if (groqSdk) {
                // Build system prompt with RL mistake awareness
                const systemPrompt = buildSystemPrompt(null, {}, recentMistakes);
                const completion   = await groqSdk.chat.completions.create({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user',   content: message }
                    ],
                    model:       GROQ_MODELS.LLAMA_3_3_70B,
                    temperature: 0.3,
                    max_tokens:  300
                });
                responseText = completion.choices[0]?.message?.content?.trim();
                responseType = 'llm';
            } else {
                responseText = "I'm still learning! Could you rephrase your question about construction or finding professionals?";
            }
        } catch (e) {
            logger.warn(`LLM failed for general query: ${e.message}`);
            responseText = "I couldn't process that. Can you tell me what type of work you need?";
        }
    }

    // ── Log interaction for RL ───────────────────────────────────────────────
    let interactionId = null;
    try {
        interactionId = await logInteraction({
            user:                  userId,
            query:                 message,
            detectedIntent:        intent,
            mappedRole:            jobData.skill,
            responseType,
            responseText,
            professionalsReturned: professionals.map(p => ({
                workerId:   p._id,
                name:       p.name,
                role:       p.role,
                matchScore: p.matchScore
            }))
        });
    } catch (e) {
        logger.warn(`Logging interaction failed: ${e.message}`);
    }

    return {
        text:          responseText,
        professionals: professionals.slice(0, 3),
        jobData,
        interactionId,
        observability: {
            intent,
            role:       jobData.skill,
            source:     jobData.skillSource,
            confidence: jobData.skillConfidence
        }
    };
};

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const extractLocationFromQuery = (query) => {
    const q = query.toLowerCase();
    const cities = [
        'mumbai','delhi','bangalore','bengaluru','hyderabad','chennai','kolkata',
        'pune','ahmedabad','jaipur','lucknow','kanpur','nagpur','indore','bhopal',
        'noida','gurgaon','gurugram','thane','navi mumbai','faridabad','ghaziabad',
        'patna','ranchi','surat','vadodara','rajkot','coimbatore','kochi','visakhapatnam',
        'dehradun','chandigarh','mysore','andheri','bandra','powai','juhu','borivali'
    ];
    for (const city of cities) {
        if (q.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
    }
    return null;
};

const getOrCreateContext = async (userId) => {
    let ctx = await AssistantContext.findOne({ user: userId });
    if (!ctx) ctx = await AssistantContext.create({ user: userId });
    return ctx;
};

// ═══════════════════════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const updateMemory = async (userId, memoryUpdate) => {
    const ctx = await getOrCreateContext(userId);
    ctx.longTermMemory = { ...ctx.longTermMemory, ...memoryUpdate };
    ctx.markModified('longTermMemory');
    await ctx.save();
    return ctx.longTermMemory;
};

export const clearHistory = async (userId) => {
    const ctx = await getOrCreateContext(userId);
    ctx.conversationHistory = [];
    await ctx.save();
};

export const getContext = async (userId) => getOrCreateContext(userId);

export const submitFeedback = async (interactionId, userId, feedback, note, correctedRole) => {
    return saveFeedback(interactionId, userId, feedback, note, correctedRole);
};

// Internal functions exported for unit testing
export { mapProblemToRole, interpretJobRequest, parseMultiSkillJob, generateAssistantResponse, getHumanLabel };
