import '../src/config/env.js';
import { mapProblemToRole, detectAmbiguity, interpretJobRequest, parseMultiSkillJob } from '../src/modules/ai/assistant/assistant.service.js';

const testCases = [
    { query: 'any two liver and builders', expected: { skills: ['labour', 'builder'], count: 2 } },
    { query: '1 plumber and 2 electricians', expected: { skills: ['plumber', 'electrician'], count: 3 } },
    { query: 'need painter and carpenter', expected: { skills: ['painter', 'carpenter'], count: 1 } },
    { query: 'two plumbr and elctrician near Mumbai', expected: { skills: ['plumber', 'electrician'], count: 2 } }
];

console.log('--- Multi-Skill Verification Start ---');
let passed = 0;
let total = testCases.length;

for (const test of testCases) {
    let actual = parseMultiSkillJob(test.query);
    
    // Sort skills for comparison
    actual.skills.sort();
    test.expected.skills.sort();

    let skillsMatch = JSON.stringify(actual.skills) === JSON.stringify(test.expected.skills);
    let countMatch = actual.count === test.expected.count;

    if (skillsMatch && countMatch) {
        console.log(`PASS: "${test.query}" -> Skills: ${actual.skills}, Count: ${actual.count}`);
        passed++;
    } else {
        console.log(`FAIL: "${test.query}" -> Actual: ${JSON.stringify(actual)}, Expected: ${JSON.stringify(test.expected)}`);
    }
}

console.log(`--- Passed: ${passed}/${total} ---`);
process.exit(passed === total ? 0 : 1);
