import Equipment from './equipment.model.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const createEquipment = (ownerId, data) => Equipment.create({ ...data, owner: ownerId });

export const listEquipment = async (query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { isAvailable: true };
    if (query.category) filter.category = query.category;
    const [items, total] = await Promise.all([Equipment.find(filter).sort(sort).skip(skip).limit(limit), Equipment.countDocuments(filter)]);
    return { items, pagination: buildPaginationMeta(total, page, limit) };
};

export const getEquipment = async (id) => {
    const e = await Equipment.findById(id).populate('owner', 'name email');
    if (!e) { const err = new Error('Equipment not found'); err.statusCode = 404; throw err; }
    return e;
};

export const updateEquipment = (id, ownerId, data) => Equipment.findOneAndUpdate({ _id: id, owner: ownerId }, data, { new: true });
export const deleteEquipment = (id, ownerId) => Equipment.findOneAndDelete({ _id: id, owner: ownerId });
