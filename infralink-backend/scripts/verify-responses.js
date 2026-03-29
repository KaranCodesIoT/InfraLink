import '../src/config/env.js';
import { generateAssistantResponse } from '../src/modules/ai/assistant/assistant.service.js';

const testCases = [
    {
        name: 'Case 1: Workers found',
        jobData: { skill: 'plumber', count: 1 },
        professionals: [{ name: 'Rahul', rating: 4.8 }],
        expectedContains: ['Rahul', '4.8⭐', 'plumber', 'hire or chat']
    },
    {
        name: 'Case 2: No workers found',
        jobData: { skill: 'plumber', location: 'Mumbai' },
        professionals: [],
        expectedContains: ['couldn’t find plumbers', 'Mumbai', 'expand search area']
    },
    {
        name: 'Case 3: Unclear query',
        jobData: { skill: null },
        professionals: [],
        expectedContains: ['what type of work', 'plumber', 'electrician']
    }
];

console.log('--- Response Generator Verification Start ---');
let passed = 0;
let total = testCases.length;

for (const test of testCases) {
    let actual = generateAssistantResponse(test.jobData, test.professionals);
    let match = test.expectedContains.every(term => actual.toLowerCase().includes(term.toLowerCase()));

    if (match) {
        console.log(`PASS: "${test.name}"`);
        passed++;
    } else {
        console.log(`FAIL: "${test.name}" -> Actual: "${actual}", Expected Terms: ${test.expectedContains}`);
    }
}

console.log(`--- Passed: ${passed}/${total} ---`);
process.exit(passed === total ? 0 : 1);
