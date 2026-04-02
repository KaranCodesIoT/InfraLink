import * as sttService from './stt.service.js';
import * as ttsService from './tts.service.js';
import { sendSuccess } from '../../../utils/response.utils.js';
import https from 'https';

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

export const proxyTTS = (req, res, next) => {
    const { tl, q } = req.query;
    if (!tl || !q) {
        return res.status(400).send('Missing language (tl) or text (q)');
    }

    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(q)}`;

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    https.get(url, options, (googleRes) => {
        if (googleRes.statusCode !== 200) {
            console.warn(`[ProxyTTS] Google returned ${googleRes.statusCode}`);
            return res.status(googleRes.statusCode).send(`Upstream TTS error: ${googleRes.statusCode}`);
        }

        res.set('Content-Type', 'audio/mpeg');
        res.set('Cache-Control', 'public, max-age=604800, immutable');
        
        // Ensure CORS for audio
        res.set('Access-Control-Allow-Origin', '*');

        googleRes.pipe(res);
    }).on('error', (err) => {
        console.error('[ProxyTTS] Failed to fetch proxy:', err.message);
        res.status(500).send('Proxy error');
    });
};
