import Material from './material.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const createMaterial = (userId, data) => Material.create({ ...data, supplier: userId });

export const listMaterials = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.city) filter['location.warehouseCity'] = query.city;
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
        Material.find(filter).sort(sort || '-createdAt').skip(skip).limit(limit).populate('supplier', 'name avatar'),
        Material.countDocuments(filter)
    ]);
    return { items, pagination: buildPaginationMeta(total, page, limit) };
};

export const getMaterial = async (id) => {
    const m = await Material.findById(id).populate('supplier', 'name avatar');
    if (!m) { const e = new Error('Material not found'); e.statusCode = 404; throw e; }
    return m;
};

export const updateMaterial = (id, userId, data) => Material.findOneAndUpdate({ _id: id, supplier: userId }, data, { new: true });
export const deleteMaterial = (id, userId) => Material.findOneAndDelete({ _id: id, supplier: userId });
