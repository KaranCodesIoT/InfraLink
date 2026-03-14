import { transcribeAudioBuffer } from '../../../integrations/stt.integration.js';
import { convertToLinear16, detectAudioFormat } from '../../../utils/audioConverter.utils.js';
import { VOICE_DEFAULTS } from '../../../constants/aiConstants.js';
import logger from '../../../utils/logger.js';

export const transcribeAudio = async (audioBuffer, mimeType, options = {}) => {
    const { languageCode = VOICE_DEFAULTS.STT_LANGUAGE } = options;

    // Detect and convert format if needed
    const { format } = detectAudioFormat(audioBuffer);
    logger.info(`STT: detected format=${format}, size=${audioBuffer.length} bytes`);

    let processedBuffer = audioBuffer;
    if (format && format !== 'wav') {
        processedBuffer = await convertToLinear16(audioBuffer, mimeType);
    }

    return transcribeAudioBuffer(processedBuffer, {
        languageCode,
        encoding: VOICE_DEFAULTS.AUDIO_ENCODING,
        sampleRateHertz: VOICE_DEFAULTS.SAMPLE_RATE,
    });
};
