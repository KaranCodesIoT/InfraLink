/**
 * Seed Knowledge Base for Infralink RAG Pipeline
 * Run: node scripts/seedKnowledge.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Dynamic import for the model
const KnowledgeBaseSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    tags: [String],
    embedding: [Number],
    metadata: { source: String, region: String, lastUpdated: Date }
}, { timestamps: true });

KnowledgeBaseSchema.index({ title: 'text', content: 'text', tags: 'text' });

const KnowledgeBase = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);

const KNOWLEDGE_DOCS = [
    {
        title: "Cost Estimation: 1BHK Construction in India",
        content: "A 1BHK apartment (400-600 sq.ft) costs ₹8-12 Lakhs to construct in Tier-2 cities. In metros like Mumbai or Delhi, costs can be ₹15-25 Lakhs due to higher labour and material rates. Key components: Foundation (12%), Structure (28%), Finishing (30%), MEP (15%), Miscellaneous (15%).",
        category: "cost_estimation",
        tags: ["1bhk", "cost", "apartment", "budget"]
    },
    {
        title: "Cost Estimation: 2BHK Construction in India",
        content: "Building a 2BHK (800-1200 sq.ft) costs ₹15-25 Lakhs in Tier-2 cities and ₹25-45 Lakhs in metros. Per sq.ft cost: ₹1,200-1,800 (basic), ₹1,800-2,500 (standard), ₹2,500-4,000 (premium). Breakdown: Foundation 10-15%, Structure 25-30%, Finishing 30-35%, MEP 15-20%.",
        category: "cost_estimation",
        tags: ["2bhk", "cost", "construction", "budget", "residential"]
    },
    {
        title: "Cost Estimation: 3BHK Construction",
        content: "A 3BHK (1500-2000 sq.ft) in metro cities costs ₹30-60 Lakhs for construction alone. Budget: Land (40-60% of total project), Construction (₹1,500-2,500/sq.ft), Interior (₹500-1,500/sq.ft). Premium finish adds 40-60% to base cost.",
        category: "cost_estimation",
        tags: ["3bhk", "cost", "metro", "budget"]
    },
    {
        title: "Cost Estimation: Villa/Bungalow",
        content: "Independent villa (2000-5000 sq.ft) construction costs ₹2,000-5,000/sq.ft depending on luxury level. Budget villa: ₹40-60 Lakhs. Premium villa: ₹1-3 Crore. Includes landscaping (₹50-150/sq.ft), swimming pool (₹8-15 Lakhs), compound wall, driveway.",
        category: "cost_estimation",
        tags: ["villa", "bungalow", "luxury", "cost"]
    },
    {
        title: "Cost Estimation: Commercial Construction",
        content: "Commercial construction rates in India: Office space ₹2,500-3,500/sq.ft, Retail showroom ₹3,000-5,000/sq.ft, Warehouse ₹1,200-2,000/sq.ft, Hospital ₹3,500-6,000/sq.ft, School ₹1,800-3,000/sq.ft. Add 18% GST on construction services.",
        category: "cost_estimation",
        tags: ["commercial", "office", "retail", "warehouse"]
    },
    {
        title: "Cost Estimation: Renovation",
        content: "Renovation costs in India: Kitchen renovation ₹2-5 Lakhs, Bathroom ₹1-3 Lakhs, Full home renovation ₹500-1,500/sq.ft, Painting ₹15-35/sq.ft, Flooring replacement ₹60-200/sq.ft, False ceiling ₹65-150/sq.ft, Electrical rewiring ₹50-80/sq.ft.",
        category: "cost_estimation",
        tags: ["renovation", "remodel", "kitchen", "bathroom"]
    },
    {
        title: "Foundation Construction Steps",
        content: "Foundation construction workflow: 1) Site survey & soil testing (₹5,000-15,000), 2) Excavation to required depth, 3) Anti-termite treatment, 4) PCC (Plain Cement Concrete) 1:4:8, 5) Footing reinforcement layout, 6) Column starters with starter bars, 7) Waterproofing membrane, 8) Backfilling & compaction. Always do soil test — it determines foundation type: isolated footing, strip, raft, or pile.",
        category: "construction_process",
        tags: ["foundation", "excavation", "pcc", "footing"]
    },
    {
        title: "Concrete Mix Ratios & Grades",
        content: "Standard concrete grades: M10 (1:3:6) lean concrete, M15 (1:2:4) flooring/paths, M20 (1:1.5:3) residential slabs/beams, M25 (1:1:2) columns/high load, M30+ for commercial/high-rise. Water-cement ratio: 0.45-0.55. Slump: 75-100mm for general work. Always use OPC 53 grade for structural. Curing: minimum 7 days, ideal 28 days.",
        category: "materials",
        tags: ["concrete", "mix", "ratio", "cement", "m20", "m25"]
    },
    {
        title: "Steel Requirements & Grades",
        content: "Steel consumption: Residential 3.5-4 kg/sq.ft, Commercial 5-6 kg/sq.ft, High-rise 6-8 kg/sq.ft. Grades: Fe500 (most used), Fe500D (earthquake zones, higher ductility), Fe550 (high strength). TMT bars preferred — ductile, corrosion-resistant. Current rates: ₹55,000-70,000/tonne. For 1000 sq.ft house: ~3,500-4,000 kg steel needed.",
        category: "materials",
        tags: ["steel", "tmt", "rebar", "fe500"]
    },
    {
        title: "Brick & Block Types",
        content: "Brick options: Red clay (₹6-10/brick, traditional), Fly ash (₹5-8, eco-friendly), AAC blocks (₹40-55/block, excellent insulation), Hollow concrete (₹35-50, load-bearing). AAC reduces construction time 30%, mortar use 60%. For 1000 sq.ft, need ~6,000-8,000 bricks or ~2,000-3,000 AAC blocks.",
        category: "materials",
        tags: ["brick", "aac", "flyash", "block"]
    },
    {
        title: "Flooring Options & Costs",
        content: "Flooring per sq.ft (material + labour): Ceramic tiles ₹40-80, Vitrified ₹60-150, Porcelain ₹100-250, Italian marble ₹200-600, Indian granite ₹100-300, Wooden flooring ₹150-400, Epoxy ₹80-200. Labour charges ₹25-50/sq.ft. Most popular: Vitrified tiles (durable, low maintenance). Premium choice: Italian marble.",
        category: "materials",
        tags: ["tiles", "flooring", "marble", "granite", "vitrified"]
    },
    {
        title: "Paint Types & Coverage",
        content: "Paint costs per sq.ft: Distemper ₹15-25 (basic), Emulsion ₹20-35 (standard), Premium emulsion ₹30-50 (washable), Texture paint ₹50-100 (decorative), Exterior paint ₹25-45. Coverage: 1L covers 100-120 sq.ft (2 coats). Popular brands: Asian Paints, Berger, Nerolac. Always prime before painting. For 1000 sq.ft home total: ₹40,000-80,000.",
        category: "materials",
        tags: ["paint", "emulsion", "interior", "exterior"]
    },
    {
        title: "Vastu Shastra: Home Guidelines",
        content: "Essential Vastu: Main entrance — North, East, or North-East (most auspicious). Master bedroom — South-West. Kitchen — South-East (Agni corner). Bathroom — North-West or West. Pooja room — North-East. Living room — North or East. Staircase — South or West (clockwise). Water tank — North-East. Avoid: toilet under stairs, kitchen above/below bedroom, south-facing main door.",
        category: "vastu",
        tags: ["vastu", "entrance", "bedroom", "kitchen", "direction"]
    },
    {
        title: "RERA Registration & Compliance",
        content: "RERA (Real Estate Regulatory Authority) is mandatory for: Projects >500 sq.m OR >8 units. Requirements: Land title, layout plan, proforma agreements, architect certificate, CA certificate, approvals list. Builder must deposit 70% in escrow. Timeline: Apply within 30 days of launch. Penalty: Up to 10% of project cost. Buyer benefits: On-time delivery, quality assurance, carpet area transparency.",
        category: "regulations",
        tags: ["rera", "registration", "builder", "compliance"]
    },
    {
        title: "Building Plan Approval Process",
        content: "Steps: 1) Hire licensed architect, 2) Prepare plan per local bylaws, 3) Submit to Municipal/Development Authority, 4) Pay scrutiny fee (0.5-2% of construction cost), 5) Fire NOC (if G+2), 6) Structural stability certificate, 7) Environmental clearance (if applicable). Timeline: 30-90 days. Check FSI/FAR limits — typically 1.0-2.5 for residential. Commencement certificate needed before starting construction.",
        category: "regulations",
        tags: ["approval", "plan", "municipal", "fsi"]
    },
    {
        title: "Electrical Wiring Standards",
        content: "Indian residential wiring: 3-phase supply if load >5kW. Wire sizes: Lighting 1.5 sq.mm, Power points 2.5 sq.mm, AC/Geyser 4 sq.mm, Main line 6-10 sq.mm. MCB ratings must match circuit load. Mandatory: ISI marked wires, ELCB/RCCB for safety, minimum 2 earthing pits. Cost: ₹50-80/sq.ft for complete wiring. Points per room: 6-10 typically.",
        category: "construction_process",
        tags: ["electrical", "wiring", "mcb", "earthing"]
    },
    {
        title: "Plumbing Standards & Pipe Sizes",
        content: "Pipe sizes: Main supply 1\" CPVC/PPR, Branch 3/4\", Toilet 1/2\", Drainage 4\" PVC, Kitchen waste 2\", Basin 1.5\" PVC. CPVC for hot water, PPR for concealed, PVC for drainage. Maintain 1% slope in drainage. Water tank: 135 litres/person/day. Plumbing cost: ₹50-80/sq.ft. Always do pressure testing before concealing pipes.",
        category: "construction_process",
        tags: ["plumbing", "pipe", "drainage", "cpvc"]
    },
    {
        title: "Waterproofing Methods",
        content: "Methods & costs/sq.ft: Cementitious coating ₹30-50 (basic), Liquid membrane ₹50-80, Bituminous membrane ₹60-100 (best for terrace), Polyurethane ₹80-150 (most durable), Injection grouting for existing leaks. Mandatory areas: Bathroom (full floor + 6\" walls), Terrace, Basement, Kitchen wet area. 10-year warranty recommended. Poor waterproofing is the #1 cause of structural damage.",
        category: "construction_process",
        tags: ["waterproofing", "terrace", "bathroom"]
    },
    {
        title: "Construction Safety Guidelines",
        content: "Mandatory safety: PPE for all workers (helmet, safety shoes, high-vis vest, gloves). Scaffolding — inspect daily, guardrails required. Fall protection above 6 feet. Fire extinguishers every 100 sq.m. First aid kit on site. Licensed electrician for temporary power. Safety nets for edge work. No work in rain/lightning. Workers' insurance mandatory. Report all accidents within 24 hours.",
        category: "safety",
        tags: ["safety", "ppe", "helmet", "scaffolding"]
    },
    {
        title: "Solar Panel Installation",
        content: "Rooftop solar: 1kW = 4 panels, ~100 sq.ft, generates ~4 units/day. Cost: ₹60,000-80,000/kW with govt subsidy (40% for first 3kW, 20% for 3-10kW). Net metering lets you sell excess. ROI: 4-5 years. Lifespan: 25 years. Best: South-facing, 15° tilt. 3kW system = ₹1.5-2 Lakhs after subsidy = ₹500-700/month savings.",
        category: "sustainability",
        tags: ["solar", "panel", "rooftop", "subsidy"]
    },
    {
        title: "Rainwater Harvesting",
        content: "Mandatory in many cities for plots >100 sq.m. Methods: Rooftop collection to underground tank, Percolation pit (3'×3'×6'), Recharge well. Cost: ₹30,000-80,000. A 1000 sq.ft roof collects ~60,000 litres/year (1000mm rainfall). Benefits: Reduced water bill, groundwater recharge, mandatory for building permit in many cities.",
        category: "sustainability",
        tags: ["rainwater", "harvesting", "water"]
    },
    {
        title: "Interior Design Cost Breakdown",
        content: "Interior design per sq.ft: Basic ₹500-800, Standard ₹800-1,500, Premium ₹1,500-3,000, Luxury ₹3,000+. Components: Modular kitchen (₹1-5 Lakhs), Wardrobes (₹40,000-2 Lakhs each), False ceiling (₹65-150/sq.ft), Lighting fixtures, Bathroom fittings, Curtains/blinds. For 1000 sq.ft 2BHK: Basic interior ₹5-8 Lakhs, Premium ₹15-30 Lakhs.",
        category: "cost_estimation",
        tags: ["interior", "design", "kitchen", "wardrobe"]
    },
    {
        title: "Labour Rates in India (2024-25)",
        content: "Daily wages vary by city. Mason: ₹700-1,200/day, Carpenter: ₹800-1,500/day, Electrician: ₹700-1,200/day, Plumber: ₹700-1,200/day, Painter: ₹600-1,000/day, Helper/Labour: ₹400-700/day, Welder: ₹800-1,500/day, Tile layer: ₹800-1,200/day. Metro cities 30-50% higher than Tier-2. Skilled contractors charge ₹1,500-5,000/day.",
        category: "cost_estimation",
        tags: ["labour", "wages", "rate", "daily"]
    },
    {
        title: "Home Loan Guide",
        content: "Home loan basics: Interest rates 8-10% (2024). Eligibility: 3-5x annual income. Down payment: 10-20% minimum. EMI for ₹50 Lakhs loan @8.5% for 20 years: ~₹43,400/month. Documents: Income proof, property papers, identity/address proof, bank statements. Tax benefits: Up to ₹2 Lakhs/year on interest (Section 24), ₹1.5 Lakhs on principal (Section 80C).",
        category: "faq",
        tags: ["loan", "home loan", "emi", "interest", "bank"]
    },
    {
        title: "Property Registration & Stamp Duty",
        content: "Stamp duty varies by state: Maharashtra 5-6%, Karnataka 5%, Delhi 4-6%, Tamil Nadu 7%, UP 5-7%. Registration fee: 1% (capped at ₹30,000 in many states). Women buyers get 1-2% concession in some states. Ready reckoner rate determines minimum property value. Total registration cost: 6-9% of property value. Online registration available in most states.",
        category: "regulations",
        tags: ["stamp duty", "registration", "property", "tax"]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        // Clear existing knowledge
        await KnowledgeBase.deleteMany({});
        console.log('🗑️ Cleared existing knowledge base');

        // Insert all documents
        await KnowledgeBase.insertMany(KNOWLEDGE_DOCS);
        console.log(`✅ Seeded ${KNOWLEDGE_DOCS.length} knowledge documents`);

        // Verify text index
        const indexes = await KnowledgeBase.collection.indexes();
        console.log(`📑 Indexes: ${indexes.map(i => i.name).join(', ')}`);

        await mongoose.disconnect();
        console.log('🔌 Disconnected. Done!');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
