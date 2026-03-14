/**
 * Speech-to-Text integration stub.
 * Supports Google Cloud Speech-to-Text or OpenAI Whisper.
 * Install: npm install @google-cloud/speech
 */
import logger from '../utils/logger.js';

export const transcribeAudioBuffer = async (audioBuffer, { languageCode = 'en-IN', encoding = 'LINEAR16', sampleRateHertz = 16000 } = {}) => {
    if (!process.env.GOOGLE_CLOUD_KEY_FILE && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        logger.warn('Google STT credentials not configured — returning stub transcript');
        return { transcript: '', confidence: 0, isStub: true };
    }

    try {
        const { SpeechClient } = await import('@google-cloud/speech');
        const client = new SpeechClient();

        const [response] = await client.recognize({
            audio: { content: audioBuffer.toString('base64') },
            config: { encoding, sampleRateHertz, languageCode },
        });

        const transcript = response.results
            .map(r => r.alternatives[0].transcript)
            .join(' ')
            .trim();

        const confidence = response.results[0]?.alternatives[0]?.confidence ?? 0;
        return { transcript, confidence };
    } catch (error) {
        logger.error(`STT error: ${error.message}`);
        throw error;
    }
};

export const transcribeAudioUri = async (gcsUri, options = {}) => {
    // For files already uploaded to GCS
    logger.warn('STT URI transcription is a stub');
    return { transcript: '', confidence: 0 };
};
