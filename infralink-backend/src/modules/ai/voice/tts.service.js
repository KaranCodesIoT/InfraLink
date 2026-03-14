import { synthesizeSpeech } from '../../../integrations/tts.integration.js';
import { VOICE_DEFAULTS } from '../../../constants/aiConstants.js';

export const textToSpeech = async (text, options = {}) => {
    const {
        languageCode = VOICE_DEFAULTS.TTS_LANGUAGE,
        voiceName = VOICE_DEFAULTS.TTS_VOICE,
    } = options;

    if (!text || !text.trim()) {
        const e = new Error('Text is required for TTS');
        e.statusCode = 400;
        throw e;
    }

    return synthesizeSpeech(text.trim(), { languageCode, voiceName, audioEncoding: 'MP3' });
};
