/**
 * Audio format conversion utilities.
 * Converts various audio formats to LINEAR16 PCM for STT APIs.
 * Install for full support: npm install fluent-ffmpeg
 */
import logger from './logger.js';

export const SUPPORTED_AUDIO_TYPES = [
    'audio/wav', 'audio/wave',
    'audio/mpeg', 'audio/mp3',
    'audio/ogg', 'audio/webm',
    'audio/flac',
];

/**
 * Get audio metadata from a buffer (basic header inspection).
 * @param {Buffer} buffer
 * @returns {{ format: string|null, sampleRate: number|null }}
 */
export const detectAudioFormat = (buffer) => {
    // WAV signature: RIFF....WAVE
    if (buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WAVE') {
        return { format: 'wav', sampleRate: buffer.readUInt32LE(24) };
    }
    // MP3 signature: ID3 or 0xFF 0xFB
    if (buffer.slice(0, 3).toString('ascii') === 'ID3' || (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0)) {
        return { format: 'mp3', sampleRate: null };
    }
    // OGG signature: OggS
    if (buffer.slice(0, 4).toString('ascii') === 'OggS') {
        return { format: 'ogg', sampleRate: null };
    }
    // FLAC signature: fLaC
    if (buffer.slice(0, 4).toString('ascii') === 'fLaC') {
        return { format: 'flac', sampleRate: null };
    }
    return { format: null, sampleRate: null };
};

/**
 * Convert audio buffer to base64 encoded LINEAR16 WAV using ffmpeg.
 * Falls back to passing the buffer as-is if ffmpeg is unavailable.
 * @param {Buffer} inputBuffer
 * @param {string} mimeType
 * @returns {Promise<Buffer>}
 */
export const convertToLinear16 = async (inputBuffer, mimeType) => {
    try {
        const ffmpeg = await import('fluent-ffmpeg');
        const { Readable, PassThrough } = await import('stream');

        return new Promise((resolve, reject) => {
            const output = new PassThrough();
            const chunks = [];

            output.on('data', chunk => chunks.push(chunk));
            output.on('end', () => resolve(Buffer.concat(chunks)));
            output.on('error', reject);

            ffmpeg.default(Readable.from(inputBuffer))
                .inputFormat(mimeType.split('/')[1])
                .audioCodec('pcm_s16le')
                .audioChannels(1)
                .audioFrequency(16000)
                .format('wav')
                .pipe(output);
        });
    } catch {
        logger.warn('fluent-ffmpeg not available — passing audio buffer as-is');
        return inputBuffer;
    }
};
