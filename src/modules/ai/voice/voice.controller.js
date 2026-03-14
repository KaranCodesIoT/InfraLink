import * as sttService from './stt.service.js';
import * as ttsService from './tts.service.js';
import { sendSuccess } from '../../../utils/response.utils.js';

export const transcribeAudio = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'Audio file is required' } });
        }
        const result = await sttService.transcribeAudio(
            req.file.buffer,
            req.file.mimetype,
            { languageCode: req.body.languageCode }
        );
        sendSuccess(res, result, 'Audio transcribed');
    } catch (e) { next(e); }
};

export const textToSpeech = async (req, res, next) => {
    try {
        const { audioBuffer, mimeType, isStub } = await ttsService.textToSpeech(req.body.text, {
            languageCode: req.body.languageCode,
            voiceName: req.body.voiceName,
        });

        if (isStub || !audioBuffer) {
            return sendSuccess(res, { isStub: true, message: 'TTS not configured — set GOOGLE_CLOUD credentials' });
        }

        res.set('Content-Type', mimeType || 'audio/mpeg');
        res.set('Content-Disposition', 'attachment; filename="speech.mp3"');
        res.send(audioBuffer);
    } catch (e) { next(e); }
};
