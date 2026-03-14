import * as equipmentService from './equipment.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const createEquipment = async (req, res, next) => {
    try { sendCreated(res, await equipmentService.createEquipment(req.user._id, req.body)); }
    catch (e) { next(e); }
};
export const listEquipment = async (req, res, next) => {
    try { const { items, pagination } = await equipmentService.listEquipment(req.query); sendPaginatedSuccess(res, items, pagination); }
    catch (e) { next(e); }
};
export const getEquipment = async (req, res, next) => {
    try { sendSuccess(res, await equipmentService.getEquipment(req.params.id)); }
    catch (e) { next(e); }
};
export const updateEquipment = async (req, res, next) => {
    try { sendSuccess(res, await equipmentService.updateEquipment(req.params.id, req.user._id, req.body), 'Updated'); }
    catch (e) { next(e); }
};
export const deleteEquipment = async (req, res, next) => {
    try { await equipmentService.deleteEquipment(req.params.id, req.user._id); sendSuccess(res, null, 'Deleted'); }
    catch (e) { next(e); }
};
