import { buildMatchPrompt } from '../../src/utils/aiPrompt.utils.js';

describe('AI Prompt Utils', () => {
    test('buildMatchPrompt should include job title and worker info', () => {
        const job = { title: 'Plumber Needed', description: 'Fix pipes', requiredSkills: ['plumbing'] };
        const workers = [{ name: 'John', skills: ['plumbing'], yearsOfExperience: 3, averageRating: 4.2, location: {} }];
        const prompt = buildMatchPrompt(job, workers);
        expect(prompt).toContain('Plumber Needed');
        expect(prompt).toContain('John');
        expect(prompt).toContain('plumbing');
    });
});
