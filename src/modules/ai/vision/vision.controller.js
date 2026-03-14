import * as visionService from './vision.service.js';
import { sendSuccess } from '../../../utils/response.utils.js';

export const analyseImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: { message: 'Image file is required' } });
        }
        const result = await visionService.analyseImage(
            req.file.buffer,
            req.file.mimetype,
            { prompt: req.body.prompt, mode: req.body.mode }
        );
        sendSuccess(res, result, 'Image analysed');
    } catch (e) { next(e); }
};
