import axios from 'axios';
import { getAccessToken } from '../../../utils/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL || 'https://infralink-production.up.railway.app/api/v1';

/**
 * Frontend AI Service for Infralink
 */
export const askInfralinkAssistant = async (question, language = 'en-IN', onChunk = null) => {
    try {
        const token = getAccessToken();
        
        const response = await fetch(`${API_URL}/ai/assistant/ask-infralink`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ question, language })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'AI Assistant is temporarily unavailable');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let finalMetadata = null;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                const chunkStr = decoder.decode(value, { stream: true });
                const events = chunkStr.split('\n\n');
                
                for (const event of events) {
                    if (event.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(event.replace('data: ', ''));
                            if (data.error) throw new Error(data.error);
                            if (data.text && onChunk) onChunk(data.text);
                            if (data.metadata) finalMetadata = data.metadata;
                        } catch (e) {
                            // Ignore partial JSON chunks gracefully
                        }
                    }
                }
            }
        }
        
        return finalMetadata;
    } catch (error) {
        console.error('AI Assistant stream error:', error);
        throw error;
    }
};

export const getAssistantHistory = async () => {
    try {
        const token = getAccessToken();
        const response = await axios.get(`${API_URL}/ai/assistant/history`, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data;
    } catch (error) {
        console.error('Fetch History Error:', error);
        return []; // Fallback to empty history without crashing
    }
};

export const transcribeAudio = async (audioBlob) => {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        const token = getAccessToken();
        
        const response = await axios.post(`${API_URL}/ai/voice/transcribe`, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Transcription Error:', error);
        throw error;
    }
};
