/**
 * Text-to-Speech integration stub.
 * Supports Google Cloud TTS or ElevenLabs.
 * Install: npm install @google-cloud/text-to-speech
 */
import logger from '../utils/logger.js';

export const synthesizeSpeech = async (text, { languageCode = 'en-IN', voiceName = 'en-IN-Standard-A', audioEncoding = 'MP3' } = {}) => {
    if (!process.env.GOOGLE_CLOUD_KEY_FILE && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        logger.warn('Google TTS credentials not configured — returning stub');
        return { audioBuffer: null, isStub: true };
    }

    try {
        const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
        const client = new TextToSpeechClient();

        const [response] = await client.synthesizeSpeech({
            input: { text },
            voice: { languageCode, name: voiceName },
            audioConfig: { audioEncoding },
        });

        return { audioBuffer: response.audioContent, mimeType: `audio/${audioEncoding.toLowerCase()}` };
    } catch (error) {
        logger.error(`TTS error: ${error.message}`);
        throw error;
    }
};

/**
 * ElevenLabs alternative (stub — set ELEVENLABS_API_KEY to activate).
 */
export const synthesizeSpeechElevenLabs = async (text, voiceId = 'default') => {
    if (!process.env.ELEVENLABS_API_KEY) {
        logger.warn('ELEVENLABS_API_KEY not set — ElevenLabs TTS disabled');
        return { audioBuffer: null, isStub: true };
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice_settings: { stability: 0.5, similarity_boost: 0.5 } }),
    });

    if (!response.ok) throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    return { audioBuffer: buffer, mimeType: 'audio/mpeg' };
};
