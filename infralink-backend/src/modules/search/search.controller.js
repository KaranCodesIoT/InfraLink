import * as searchService from './search.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export const search = async (req, res, next) => {
    try {
        const { q, type } = req.query;
        const results = await searchService.globalSearch(q, type);
        sendSuccess(res, results);
    } catch (e) { next(e); }
};
