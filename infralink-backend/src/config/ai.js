import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

export const getGenAI = () => {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

export const getModel = (modelName = 'gemini-pro') => {
    return getGenAI().getGenerativeModel({ model: modelName });
};
