import { computeMatchScore } from '../../src/utils/scoring.utils.js';

describe('Scoring Utils', () => {
    const baseWorker = {
        skills: ['plumbing', 'welding'],
        yearsOfExperience: 5,
        averageRating: 4.5,
        isAvailable: true,
        location: { coordinates: [77, 28] },
    };

    const baseJob = {
        requiredSkills: ['plumbing'],
        location: { coordinates: [77, 28] },
    };

    test('should return a score between 0 and 100', () => {
        const score = computeMatchScore(baseWorker, baseJob);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    test('perfect skill match should give higher score than no match', () => {
        const noMatch = computeMatchScore({ ...baseWorker, skills: ['carpentry'] }, baseJob);
        const fullMatch = computeMatchScore(baseWorker, baseJob);
        expect(fullMatch).toBeGreaterThan(noMatch);
    });
});
