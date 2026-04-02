import User from '../../users/user.model.js';
import Project from '../../projects/project.model.js';
import Material from '../../marketplace/material.model.js';
import logger from '../../../utils/logger.js';

/**
 * STRICT DB queries with scoring and ranking.
 * Priority: Exact skill match → Location match → Rating → Availability
 */

// ─── Workers (STRICT + RANKED) ───────────────────────────────────────────────
export const searchWorkers = async ({ skill, area, city, rawQuery }) => {
    logger.info(`[DB] searchWorkers STRICT | skill="${skill}" area="${area}" city="${city}"`);

    // ── TIER 1: Exact skill + exact area ────────────────────────────────────
    let results = [];
    if (skill && area) {
        results = await queryWorkers(buildSkillFilter(skill), buildAreaFilter(area));
        logger.info(`[DB] Tier 1 (skill+area): ${results.length}`);
    }

    // ── TIER 2: Exact skill + city (wider location) ─────────────────────────
    if (results.length === 0 && skill && city) {
        results = await queryWorkers(buildSkillFilter(skill), buildCityFilter(city));
        logger.info(`[DB] Tier 2 (skill+city): ${results.length}`);
    }

    // ── TIER 3: Exact skill only (any location) ─────────────────────────────
    if (results.length === 0 && skill) {
        results = await queryWorkers(buildSkillFilter(skill), null);
        logger.info(`[DB] Tier 3 (skill only): ${results.length}`);
    }

    // ── TIER 4: Area/city only (if no skill was specified) ──────────────────
    if (results.length === 0 && !skill && (area || city)) {
        const locFilter = area ? buildAreaFilter(area) : buildCityFilter(city);
        results = await queryWorkers(null, locFilter);
        logger.info(`[DB] Tier 4 (location only): ${results.length}`);
    }

    // ── NO FALLBACK to "all professionals" — that's the bug we're fixing ────
    // Instead, return empty with clear message

    // ── SCORE AND RANK Results ──────────────────────────────────────────────
    const scored = results.map(w => ({
        ...w,
        _score: calculateWorkerScore(w, skill, area, city)
    }));

    scored.sort((a, b) => b._score - a._score);

    // Mark top recommendations
    if (scored.length > 0) {
        scored[0]._isTopPick = true;
        if (scored.length > 1) scored[1]._isTopPick = true;
    }

    logger.info(`[DB] Final ranked: ${scored.length} workers (top score: ${scored[0]?._score || 0})`);

    return {
        results: scored,
        count: scored.length,
        searchCriteria: { skill, area, city },
        hasExactMatch: scored.some(w => w._score >= 80),
        topPicks: scored.filter(w => w._isTopPick),
        tier: results.length > 0 ? getTier(skill, area, city, scored) : 'none'
    };
};

/**
 * Build a STRICT skill filter — only match the exact skill, not "builder" when user asked for "electrician"
 */
function buildSkillFilter(skill) {
    // Use word-boundary-like matching: match the skill as a standalone word
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|,)${escapedSkill}(\\s|,|$)`, 'i');

    return {
        $or: [
            { contractorType: regex },
            { skills: regex },
            { role: new RegExp(`^${escapedSkill}$`, 'i') },  // Exact role match
            { bio: regex }
        ]
    };
}

function buildAreaFilter(area) {
    return {
        $or: [
            { 'location.city': new RegExp(area, 'i') },
            { 'location.address': new RegExp(area, 'i') },
            { 'location.area': new RegExp(area, 'i') }
        ]
    };
}

function buildCityFilter(city) {
    return {
        $or: [
            { 'location.city': new RegExp(city, 'i') },
            { 'location.state': new RegExp(city, 'i') },
            { 'location.address': new RegExp(city, 'i') }
        ]
    };
}

async function queryWorkers(skillFilter, locationFilter) {
    const conditions = [];
    if (skillFilter) conditions.push(skillFilter);
    if (locationFilter) conditions.push(locationFilter);

    const query = conditions.length > 0 ? { $and: conditions } : {};

    return User.find(query)
        .select('name avatar contractorType skills role rating location bio experience hourlyRate isAvailable')
        .limit(15)
        .lean();
}

/**
 * Score a worker on 0–100 scale based on match quality
 */
function calculateWorkerScore(worker, skill, area, city) {
    let score = 0;

    // ── Skill match (0–40 points) ───────────────────────────────────────
    if (skill) {
        const skillLower = skill.toLowerCase();
        const contractorType = (worker.contractorType || '').toLowerCase();
        const role = (worker.role || '').toLowerCase();
        const skills = (worker.skills || []).map(s => (typeof s === 'string' ? s : '').toLowerCase());
        const bio = (worker.bio || '').toLowerCase();

        if (contractorType === skillLower || role === skillLower) {
            score += 40; // Exact match
        } else if (contractorType.includes(skillLower) || skills.some(s => s.includes(skillLower))) {
            score += 30; // Partial match
        } else if (bio.includes(skillLower)) {
            score += 15; // Bio mention
        }
    }

    // ── Location match (0–30 points) ────────────────────────────────────
    const workerCity = (worker.location?.city || '').toLowerCase();
    const workerAddress = (worker.location?.address || '').toLowerCase();
    const workerArea = (worker.location?.area || '').toLowerCase();

    if (area) {
        const areaLower = area.toLowerCase();
        if (workerArea === areaLower || workerCity === areaLower || workerAddress.includes(areaLower)) {
            score += 30; // Exact area match
        } else if (city && (workerCity.includes(city.toLowerCase()) || workerAddress.includes(city.toLowerCase()))) {
            score += 15; // Same city, different area
        }
    } else if (city) {
        const cityLower = city.toLowerCase();
        if (workerCity.includes(cityLower) || workerAddress.includes(cityLower)) {
            score += 25; // City match
        }
    }

    // ── Rating (0–20 points) ────────────────────────────────────────────
    const rating = parseFloat(worker.rating) || 0;
    score += Math.min(20, rating * 4); // 5.0 rating = 20 points

    // ── Availability (0–10 points) ──────────────────────────────────────
    if (worker.isAvailable !== false) {
        score += 10;
    }

    return Math.round(score);
}

function getTier(skill, area, city, results) {
    if (skill && area && results.length > 0) return 'exact';
    if (skill && city && results.length > 0) return 'city';
    if (skill && results.length > 0) return 'skill_only';
    return 'broad';
}


// ─── Projects ─────────────────────────────────────────────────────────────────
export const searchProjects = async ({ title, type, budget }) => {
    logger.info(`[DB] searchProjects | title="${title}" type="${type}"`);

    let results;
    const orConditions = [];

    if (title) {
        const words = title.split(/\s+/).filter(w => w.length > 2);
        const pattern = words.join('|');
        orConditions.push(
            { title: new RegExp(pattern, 'i') },
            { description: new RegExp(pattern, 'i') }
        );
    }
    if (type) {
        orConditions.push({ category: new RegExp(type, 'i') }, { title: new RegExp(type, 'i') });
    }

    if (orConditions.length > 0) {
        results = await Project.find({ $or: orConditions })
            .select('title description status progress budget startDate endDate images model3DUrl location category')
            .sort({ createdAt: -1 }).limit(10).lean();
    }

    if (!results || results.length === 0) {
        results = await Project.find({})
            .select('title description status progress budget startDate endDate images model3DUrl location category')
            .sort({ createdAt: -1 }).limit(10).lean();
    }

    return { results, count: results.length };
};

// ─── Materials ────────────────────────────────────────────────────────────────
export const searchMaterials = async ({ name }) => {
    logger.info(`[DB] searchMaterials | name="${name}"`);
    const query = {};
    if (name) {
        query.$or = [
            { name: new RegExp(name, 'i') },
            { category: new RegExp(name, 'i') }
        ];
    }

    let results = await Material.find(query)
        .select('name price unit category quantity location images description isAvailable')
        .sort({ price: 1 }).limit(10).lean();

    if (results.length === 0) {
        results = await Material.find({ isAvailable: true })
            .select('name price unit category quantity location images description isAvailable')
            .sort({ createdAt: -1 }).limit(10).lean();
    }

    return { results, count: results.length };
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const searchJobs = async ({ query }) => {
    logger.info(`[DB] searchJobs | query="${query}"`);
    let Job;
    try { Job = (await import('../../jobs/job.model.js')).default; }
    catch { return { results: [], count: 0 }; }

    let results;
    if (query) {
        const words = query.split(/\s+/).filter(w => w.length > 2);
        const pattern = words.join('|');
        results = await Job.find({
            $or: [
                { title: new RegExp(pattern, 'i') },
                { description: new RegExp(pattern, 'i') }
            ],
            status: 'open'
        }).select('title description budget location skills status deadline').sort({ createdAt: -1 }).limit(10).lean();
    }

    if (!results || results.length === 0) {
        results = await Job.find({ status: 'open' })
            .select('title description budget location skills status deadline')
            .sort({ createdAt: -1 }).limit(10).lean();
    }

    return { results, count: results.length };
};

// ─── Platform Stats ───────────────────────────────────────────────────────────
export const getPlatformStats = async () => {
    const [totalUsers, totalProjects, totalMaterials] = await Promise.all([
        User.countDocuments(), Project.countDocuments(), Material.countDocuments()
    ]);
    const roleBreakdown = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    return {
        totalUsers, totalProjects, totalMaterials,
        roleBreakdown: roleBreakdown.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {})
    };
};
