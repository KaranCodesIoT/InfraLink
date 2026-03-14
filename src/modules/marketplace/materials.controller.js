import * as materialsService from './materials.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const createMaterial = async (req, res, next) => {
    try { sendCreated(res, await materialsService.createMaterial(req.user._id, req.body)); }
    catch (e) { next(e); }
};
export const listMaterials = async (req, res, next) => {
    try { const { items, pagination } = await materialsService.listMaterials(req.query); sendPaginatedSuccess(res, items, pagination); }
    catch (e) { next(e); }
};
export const getMaterial = async (req, res, next) => {
    try { sendSuccess(res, await materialsService.getMaterial(req.params.id)); }
    catch (e) { next(e); }
};
export const updateMaterial = async (req, res, next) => {
    try { sendSuccess(res, await materialsService.updateMaterial(req.params.id, req.user._id, req.body), 'Updated'); }
    catch (e) { next(e); }
};
export const deleteMaterial = async (req, res, next) => {
    try { await materialsService.deleteMaterial(req.params.id, req.user._id); sendSuccess(res, null, 'Deleted'); }
    catch (e) { next(e); }
};
