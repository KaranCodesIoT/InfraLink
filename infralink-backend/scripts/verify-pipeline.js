import '../src/config/env.js';
import { askAssistant } from '../src/modules/ai/assistant/assistant.service.js';

const userId = '654321098765432109876543'; // Dummy ID

const runTest = async (query) => {
    console.log(`\nQuery: "${query}"`);
    try {
        const result = await askAssistant(userId, query);
        console.log(`Response: "${result.text}"`);
        console.log(`Pros Found: ${result.professionals.length}`);
        console.log(`Job Data: ${JSON.stringify(result.jobData)}`);
        return result;
    } catch (e) {
        console.error(`Pipeline Failed: ${e.message}`);
        return null;
    }
};

const start = async () => {
    console.log('--- End-to-End Pipeline Verification Start ---');
    
    // Test Case 1: Complex Hiring Request
    await runTest("Need two plumbers in Mumbai urgently");

    // Test Case 2: Multi-Skill / Typo
    await runTest("any two liver and builders");

    // Test Case 3: Ambiguous
    await runTest("hello help me");

    console.log('\n--- Verification Finished ---');
    process.exit(0);
};

start();
