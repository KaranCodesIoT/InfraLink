import KnowledgeBase from './knowledgeBase.model.js';
import { initVectorizer, findSimilar } from './embeddingService.js';
import logger from '../../../utils/logger.js';

let knowledgeDocs = null;
let isInitialized = false;

/**
 * Initialize RAG pipeline — load knowledge docs and build vectorizer
 */
export const initRAG = async () => {
    try {
        knowledgeDocs = await KnowledgeBase.find({}).lean();

        if (knowledgeDocs.length === 0) {
            logger.warn('[RAG] No knowledge documents found. Using built-in fallback.');
            knowledgeDocs = FALLBACK_KNOWLEDGE;
        }

        initVectorizer(knowledgeDocs);
        isInitialized = true;
        logger.info(`[RAG] Pipeline initialized with ${knowledgeDocs.length} documents`);
    } catch (err) {
        logger.error(`[RAG] Init failed: ${err.message}. Using fallback.`);
        knowledgeDocs = FALLBACK_KNOWLEDGE;
        initVectorizer(knowledgeDocs);
        isInitialized = true;
    }
};

/**
 * Search knowledge base using TF-IDF similarity
 * Returns formatted context string for LLM injection
 */
export const searchKnowledge = async (query, topK = 3) => {
    if (!isInitialized) await initRAG();

    try {
        // Strategy 1: TF-IDF vector similarity
        const similar = findSimilar(query, knowledgeDocs, topK);

        if (similar.length > 0) {
            logger.info(`[RAG] Found ${similar.length} relevant docs (top score: ${similar[0].score.toFixed(3)})`);
            return {
                context: similar.map(r => `--- ${r.title} ---\n${r.content}`).join('\n\n'),
                sources: similar.map(r => ({ title: r.title, category: r.category, score: r.score })),
                found: true
            };
        }

        // Strategy 2: MongoDB text search fallback
        const textResults = await KnowledgeBase.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).limit(topK).lean();

        if (textResults.length > 0) {
            logger.info(`[RAG] Text search found ${textResults.length} docs`);
            return {
                context: textResults.map(r => `--- ${r.title} ---\n${r.content}`).join('\n\n'),
                sources: textResults.map(r => ({ title: r.title, category: r.category })),
                found: true
            };
        }

        // Strategy 3: Category-based keyword fallback
        const categoryMap = {
            'cost': 'cost_estimation',
            'price': 'cost_estimation',
            'budget': 'cost_estimation',
            'estimate': 'cost_estimation',
            'material': 'materials',
            'cement': 'materials',
            'steel': 'materials',
            'sand': 'materials',
            'vastu': 'vastu',
            'direction': 'vastu',
            'rera': 'regulations',
            'permit': 'regulations',
            'approval': 'regulations',
            'foundation': 'construction_process',
            'plumbing': 'construction_process',
            'wiring': 'construction_process',
            'safety': 'safety',
            'helmet': 'safety'
        };

        const queryLower = query.toLowerCase();
        let matchedCategory = null;
        for (const [keyword, category] of Object.entries(categoryMap)) {
            if (queryLower.includes(keyword)) {
                matchedCategory = category;
                break;
            }
        }

        if (matchedCategory) {
            const catResults = knowledgeDocs.filter(d => d.category === matchedCategory).slice(0, topK);
            if (catResults.length > 0) {
                logger.info(`[RAG] Category fallback: found ${catResults.length} docs in "${matchedCategory}"`);
                return {
                    context: catResults.map(r => `--- ${r.title} ---\n${r.content}`).join('\n\n'),
                    sources: catResults.map(r => ({ title: r.title, category: r.category })),
                    found: true
                };
            }
        }

        logger.info('[RAG] No relevant knowledge found');
        return { context: null, sources: [], found: false };

    } catch (err) {
        logger.error(`[RAG] Search error: ${err.message}`);
        return { context: null, sources: [], found: false };
    }
};

/**
 * Add a new knowledge document to the base
 */
export const addKnowledge = async ({ title, content, category, tags }) => {
    const doc = await KnowledgeBase.create({ title, content, category, tags });

    // Rebuild vectorizer with new doc
    knowledgeDocs.push(doc.toObject());
    initVectorizer(knowledgeDocs);

    logger.info(`[RAG] Added knowledge: "${title}"`);
    return doc;
};

// ─── Built-in Fallback Knowledge ──────────────────────────────────────────────
const FALLBACK_KNOWLEDGE = [
    {
        title: "Cost Estimation: 2BHK Construction in India",
        content: "Building a 2BHK in India typically costs between ₹1,200 to ₹1,800 per sq.ft depending on material quality and city. For a 1000 sq.ft house, budget around ₹15-20 Lakhs. Premium finishes can push this to ₹2,500/sq.ft. Key cost components: Foundation (10-15%), Structure (25-30%), Finishing (30-35%), MEP (15-20%).",
        category: "cost_estimation",
        tags: ["2bhk", "cost", "construction", "budget", "residential"]
    },
    {
        title: "Cost Estimation: 3BHK Construction",
        content: "A 3BHK (1500-2000 sq.ft) in metro cities costs ₹25-45 Lakhs depending on quality. Budget breakdown: Land (40-60% of total), Construction (₹1,500-2,500/sq.ft), Interior (₹500-1,500/sq.ft). Key factors: location, floor count, material grade.",
        category: "cost_estimation",
        tags: ["3bhk", "cost", "metro", "budget"]
    },
    {
        title: "Cost Estimation: Commercial Construction",
        content: "Commercial construction in India ranges from ₹2,000-4,000 per sq.ft. Office spaces: ₹2,500-3,500/sq.ft. Retail: ₹3,000-5,000/sq.ft. Warehouse: ₹1,200-2,000/sq.ft. Factors: fire safety compliance, HVAC, elevator, parking.",
        category: "cost_estimation",
        tags: ["commercial", "office", "retail", "warehouse"]
    },
    {
        title: "Foundation Construction Steps",
        content: "Foundation construction follows these steps: 1) Site survey and soil testing, 2) Excavation to required depth, 3) PCC (Plain Cement Concrete) layer - 1:4:8 ratio, 4) Footing reinforcement and column starters, 5) Anti-termite treatment, 6) Waterproofing membrane, 7) Backfilling and compaction. Always get soil testing done before deciding foundation type (isolated, combined, strip, or raft).",
        category: "construction_process",
        tags: ["foundation", "excavation", "pcc", "footing"]
    },
    {
        title: "Vastu Shastra: Essential Tips for Home",
        content: "Key Vastu guidelines: Main entrance ideally in North, East, or North-East. Master bedroom in South-West. Kitchen in South-East (Agni corner). Bathroom in North-West or West. Pooja room in North-East. Living room in North or East. Staircase in South or West. Avoid toilet under staircase. Water tank in North-East.",
        category: "vastu",
        tags: ["vastu", "entrance", "bedroom", "kitchen", "direction"]
    },
    {
        title: "Concrete Mix Ratios",
        content: "Standard concrete mix ratios: M15 = 1:2:4 (general purpose), M20 = 1:1.5:3 (standard residential slabs and beams), M25 = 1:1:2 (structural columns, high-load areas), M30 and above for commercial/high-rise. Water-cement ratio should be 0.45-0.55. Always use OPC 53 grade cement for structural work.",
        category: "materials",
        tags: ["concrete", "mix", "ratio", "cement", "m20", "m25"]
    },
    {
        title: "Steel Requirements for Construction",
        content: "Steel consumption guide: Residential buildings need 3.5-4 kg/sq.ft of steel. Commercial: 5-6 kg/sq.ft. For a 1000 sq.ft house, you need approximately 3,500-4,000 kg of steel. Common grades: Fe500 (most used), Fe500D (earthquake zones), Fe550. TMT bars are preferred for their ductility and corrosion resistance.",
        category: "materials",
        tags: ["steel", "tmt", "rebar", "fe500", "construction"]
    },
    {
        title: "RERA Registration Requirements",
        content: "RERA (Real Estate Regulatory Authority) registration is mandatory for projects above 500 sq.m or more than 8 units. Requirements: Land title documents, layout plan, project plan, proforma agreements, list of approvals obtained. Builder must deposit 70% of project funds in escrow. Penalties for non-compliance: up to 10% of project cost.",
        category: "regulations",
        tags: ["rera", "registration", "builder", "compliance", "regulation"]
    },
    {
        title: "Construction Safety Guidelines",
        content: "Essential safety measures: All workers must wear PPE (helmet, safety shoes, high-vis vest). Scaffolding must be inspected daily. Fall protection required above 6 feet. Fire extinguishers at every 100 sq.m. First aid kit mandatory on site. Licensed electrician for temporary power. Safety net below all edge work.",
        category: "safety",
        tags: ["safety", "ppe", "helmet", "scaffolding", "construction"]
    },
    {
        title: "Waterproofing Methods",
        content: "Common waterproofing methods: 1) Cementitious coating (cheapest, ₹30-50/sq.ft), 2) Liquid membrane (₹50-80/sq.ft), 3) Bituminous membrane (₹60-100/sq.ft, best for terrace), 4) Polyurethane coating (₹80-150/sq.ft, best durability), 5) Injection grouting (for existing leaks). Bathroom waterproofing is mandatory up to 6 inches on walls and full floor.",
        category: "construction_process",
        tags: ["waterproofing", "terrace", "bathroom", "membrane", "leak"]
    },
    {
        title: "Brick Types and Costs",
        content: "Common brick types in India: Red clay bricks (₹6-10 each, traditional), Fly ash bricks (₹5-8, eco-friendly, lighter), AAC blocks (₹40-55 per block, excellent insulation, faster construction), Hollow concrete blocks (₹35-50, good for load-bearing). AAC blocks reduce construction time by 30% and mortar by 60%.",
        category: "materials",
        tags: ["brick", "aac", "flyash", "block", "wall"]
    },
    {
        title: "Electrical Wiring Standards",
        content: "Indian electrical standards for residential: Main supply - 3 phase if load > 5kW. Wire sizes: Lighting circuit - 1.5 sq.mm, Power circuit - 2.5 sq.mm, AC circuit - 4 sq.mm, Geyser - 4 sq.mm. MCB ratings should match. Use ISI marked wires only. Earthing is mandatory for every circuit. Minimum 2 earthing pits required.",
        category: "construction_process",
        tags: ["electrical", "wiring", "mcb", "earthing", "circuit"]
    },
    {
        title: "Plumbing Pipe Sizes",
        content: "Standard plumbing pipe sizes: Main water supply - 1 inch CPVC/PPR, Branch supply - 3/4 inch, Toilet flush - 1/2 inch, Drainage - 4 inch PVC, Kitchen waste - 2 inch PVC, Basin waste - 1.5 inch PVC. CPVC pipes are preferred for hot water. PPR pipes for concealed work. Always maintain 1% slope in drainage.",
        category: "construction_process",
        tags: ["plumbing", "pipe", "drainage", "cpvc", "pvc"]
    },
    {
        title: "Floor Tile Types and Rates",
        content: "Tile options and rates per sq.ft: Ceramic (₹25-60, budget), Vitrified (₹40-120, most popular), Porcelain (₹80-200, premium), Italian marble (₹150-500, luxury), Granite (₹80-250, durable). Laying charges: ₹25-45/sq.ft. For 1000 sq.ft, total flooring budget: ₹80,000-2,50,000 depending on material.",
        category: "materials",
        tags: ["tiles", "flooring", "vitrified", "marble", "granite"]
    },
    {
        title: "Paint Types and Coverage",
        content: "Interior paint types: Distemper (₹15-25/sq.ft, basic), Emulsion (₹20-35/sq.ft, standard), Premium emulsion (₹30-50/sq.ft, washable), Texture paint (₹50-100/sq.ft, decorative). Coverage: 1 litre covers ~100-120 sq.ft (2 coats). Exterior paint: ₹25-45/sq.ft. Always apply primer before paint. Total painting cost for 1000 sq.ft = ₹40,000-80,000.",
        category: "materials",
        tags: ["paint", "emulsion", "interior", "exterior", "texture"]
    },
    {
        title: "Building Plan Approval Process",
        content: "Steps for building plan approval in India: 1) Hire licensed architect, 2) Prepare building plan per local bylaws, 3) Submit to Municipal Corporation/Development Authority, 4) Pay scrutiny fee, 5) NOC from fire department (if above ground+2), 6) Structural stability certificate, 7) Environmental clearance (if applicable). Timeline: 30-90 days. Always check FSI/FAR limits.",
        category: "regulations",
        tags: ["approval", "plan", "municipal", "fsi", "far", "noc"]
    },
    {
        title: "Solar Panel Installation Guide",
        content: "Solar panel setup for homes: 1kW system (4 panels) costs ₹60,000-80,000 with subsidy. Generates ~4 units/day. Rooftop needs ~100 sq.ft per kW. Government subsidy: 40% for first 3kW, 20% for 3-10kW. Net metering allows selling excess to grid. ROI period: 4-5 years. Lifespan: 25 years. Best orientation: South-facing at 15° tilt.",
        category: "sustainability",
        tags: ["solar", "panel", "rooftop", "subsidy", "renewable"]
    },
    {
        title: "Rainwater Harvesting Setup",
        content: "Rainwater harvesting is mandatory in many Indian cities for plots above 100 sq.m. Methods: Rooftop collection to underground tank, Percolation pit (3ft x 3ft x 6ft deep), Recharge well. Cost: ₹30,000-80,000 depending on method. A 1000 sq.ft roof can collect 60,000 litres/year in areas with 1000mm rainfall.",
        category: "sustainability",
        tags: ["rainwater", "harvesting", "recharge", "water", "conservation"]
    }
];
