import Material from './material.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const createMaterial = (sellerId, data) => Material.create({ ...data, seller: sellerId });

export const listMaterials = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { isAvailable: true };
    if (query.category) filter.category = query.category;
    const [items, total] = await Promise.all([Material.find(filter).sort(sort).skip(skip).limit(limit), Material.countDocuments(filter)]);
    return { items, pagination: buildPaginationMeta(total, page, limit) };
};

export const getMaterial = async (id) => {
    const m = await Material.findById(id).populate('seller', 'name email');
    if (!m) { const e = new Error('Material not found'); e.statusCode = 404; throw e; }
    return m;
};

export const updateMaterial = (id, sellerId, data) => Material.findOneAndUpdate({ _id: id, seller: sellerId }, data, { new: true });
export const deleteMaterial = (id, sellerId) => Material.findOneAndDelete({ _id: id, seller: sellerId });
