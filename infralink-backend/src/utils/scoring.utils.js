/**
 * Compute a composite match score for a worker-job pair.
 * @param {object} worker - Worker profile document
 * @param {object} job - Job document
 * @returns {number} Score 0–100
 */
export const computeMatchScore = (worker, job) => {
    let score = 0;

    // Skill overlap (up to 40 pts)
    const workerSkills = new Set((worker.skills || []).map((s) => s.toLowerCase()));
    const requiredSkills = job.requiredSkills || [];
    const matched = requiredSkills.filter((s) => workerSkills.has(s.toLowerCase()));
    if (requiredSkills.length > 0) {
        score += (matched.length / requiredSkills.length) * 40;
    }

    // Experience (up to 20 pts)
    const expScore = Math.min(worker.yearsOfExperience || 0, 10) * 2;
    score += expScore;

    // Rating (up to 20 pts)
    if (worker.averageRating) {
        score += (worker.averageRating / 5) * 20;
    }

    // Availability (10 pts)
    if (worker.isAvailable) score += 10;

    // Location (10 pts) — crude; fine-grained handled by AI
    if (worker.location && job.location) score += 10;

    return Math.round(Math.min(score, 100));
};
