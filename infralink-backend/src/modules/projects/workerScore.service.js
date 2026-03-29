import WorkerScore from './workerScore.model.js';

/* ─────────────────────────── Helpers ──────────────────────────── */

const getOrCreate = async (userId) => {
    let score = await WorkerScore.findOne({ user: userId });
    if (!score) {
        score = await WorkerScore.create({ user: userId });
    }
    return score;
};

/* ──────────────────── Award / Deduct Points ──────────────────── */

export const awardPoints = async (userId, points, reason, projectId = null) => {
    const score = await getOrCreate(userId);

    score.totalPoints += points;
    if (score.totalPoints < 0) score.totalPoints = 0;

    // Track totals
    if (reason.toLowerCase().includes('daily update') || reason.toLowerCase().includes('on-time')) {
        score.totalUpdates += 1;

        // Streak logic
        score.streakCurrent += 1;
        if (score.streakCurrent > score.streakBest) {
            score.streakBest = score.streakCurrent;
        }
    }

    if (reason.toLowerCase().includes('missed')) {
        score.missedUpdates += 1;
        score.streakCurrent = 0; // break streak
    }

    if (reason.toLowerCase().includes('project completed')) {
        score.projectsCompleted += 1;
    }

    // Push to history (cap at 200)
    score.history.push({ project: projectId, points, reason, date: new Date() });
    if (score.history.length > 200) {
        score.history = score.history.slice(-200);
    }

    // Recalculate consistency
    const totalPossible = score.totalUpdates + score.missedUpdates;
    if (totalPossible > 0) {
        score.consistencyScore = Math.round((score.totalUpdates / totalPossible) * 100);
    }

    await score.save();
    return score;
};

/* ────────────────── Recalculate Consistency ──────────────────── */

export const recalculateConsistency = async (userId) => {
    const score = await getOrCreate(userId);
    const totalPossible = score.totalUpdates + score.missedUpdates;
    if (totalPossible > 0) {
        score.consistencyScore = Math.round((score.totalUpdates / totalPossible) * 100);
    } else {
        score.consistencyScore = 0;
    }
    await score.save();
    return score;
};

/* ──────────────────── Get Score Card ─────────────────────────── */

export const getScoreCard = async (userId) => {
    const score = await WorkerScore.findOne({ user: userId })
        .populate('user', 'name avatar role')
        .lean();

    if (!score) {
        return {
            user: userId,
            totalPoints: 0,
            consistencyScore: 0,
            projectsCompleted: 0,
            totalUpdates: 0,
            missedUpdates: 0,
            streakCurrent: 0,
            streakBest: 0,
            history: [],
        };
    }

    return score;
};

/* ──────────────────── Leaderboard ────────────────────────────── */

export const getLeaderboard = async (limit = 20) => {
    const leaders = await WorkerScore.find({ totalPoints: { $gt: 0 } })
        .populate('user', 'name avatar role')
        .sort('-totalPoints')
        .limit(limit)
        .lean();

    return leaders;
};
