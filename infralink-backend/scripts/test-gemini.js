import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const testGemini = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log(`Checking API Key: ${key ? key.substring(0, 5) + '...' : 'MISSING'}`);

    if (!key || key === 'your_gemini_api_key') {
        console.error('ERROR: GEMINI_API_KEY is still a placeholder!');
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hello, are you working?');
        console.log('SUCCESS: Gemini connection established!');
        console.log('Response:', result.response.text());
    } catch (error) {
        console.error('ERROR: Gemini connection failed!');
        console.error(error.message);
        process.exit(1);
    }
};

testGemini();
