import Groq from 'groq-sdk';

let groq;

export const getGroq = () => {
    if (!groq) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key') {
            return null;
        }
        groq = new Groq({ apiKey });
    }
    return groq;
};

export const GROQ_MODELS = {
    LLAMA_3_3_70B: "llama-3.3-70b-versatile",
    LLAMA_3_1_70B: "llama-3.1-70b-versatile",
    MIXTRAL_8X7B: "mixtral-8x7b-32768"
};
