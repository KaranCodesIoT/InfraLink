import { mapProblemToRole, detectAmbiguity } from '../../src/modules/ai/assistant/assistant.service.js';

describe('AI Skill Mapping and Ambiguity Detection', () => {
    
    describe('mapProblemToRole()', () => {
        test('should map "Iron gate welding" to welder', () => {
            const role = mapProblemToRole('Iron gate welding');
            expect(role).toBe('welder');
        });

        test('should map "bathroom pipe leak" to plumber', () => {
            const role = mapProblemToRole('bathroom pipe leak');
            expect(role).toBe('plumber');
        });

        test('should map "house wiring issue" to electrician', () => {
            const role = mapProblemToRole('house wiring issue');
            expect(role).toBe('electrician');
        });

        test('should map "bijli wala" to electrician', () => {
            const role = mapProblemToRole('bijli wala');
            expect(role).toBe('electrician');
        });

        test('should map "wall painting" to painter', () => {
            const role = mapProblemToRole('wall painting');
            expect(role).toBe('painter');
        });

        test('should map "gas refill for split ac" to ac_technician', () => {
            const role = mapProblemToRole('gas refill for split ac');
            expect(role).toBe('ac_technician');
        });

        test('should map "thekedar for house construction" to contractor', () => {
            const role = mapProblemToRole('thekedar for house construction');
            expect(role).toBe('contractor');
        });
    });

    describe('detectAmbiguity()', () => {
        test('should detect "help me" as ambiguous', () => {
            const clarification = detectAmbiguity('help me');
            expect(clarification).toContain('What type of maintenance');
        });

        test('should detect "fix the gate" as ambiguous', () => {
            const clarification = detectAmbiguity('fix the gate');
            expect(clarification).toContain('wooden door');
            expect(clarification).toContain('welder');
        });

        test('should detect "ac issue" as ambiguous', () => {
            const clarification = detectAmbiguity('ac issue');
            expect(clarification).toContain('cooling/servicing');
            expect(clarification).toContain('electrician');
        });

        test('should return null for specific query "I need a plumber"', () => {
            const clarification = detectAmbiguity('I need a plumber');
            expect(clarification).toBeNull();
        });
    });
});
