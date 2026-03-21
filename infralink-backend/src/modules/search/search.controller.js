import * as searchService from './search.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export const search = async (req, res, next) => {
    try {
        const { q, type } = req.query;
        const currentUserId = req.user ? req.user._id : null;
        const results = await searchService.globalSearch(q, type, currentUserId);
        sendSuccess(res, results);
    } catch (e) { next(e); }
};
