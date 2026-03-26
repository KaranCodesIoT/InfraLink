import Joi from 'joi';

export const createBuilderProjectSchema = Joi.object({
    projectName: Joi.string().required().label('Project Name'),
    city: Joi.string().required().label('City'),
    area: Joi.string().required().label('Area'),
    propertyType: Joi.string().valid('Flat', 'Villa', 'Commercial').required().label('Property Type'),
    configuration: Joi.string().required().label('Configuration'),
    projectStatus: Joi.string().valid('Under Construction', 'Ready to Move').required().label('Project Status'),

    price: Joi.number().min(0).required().label('Price'),
    totalUnits: Joi.number().integer().min(1).required().label('Total Units'),
    availableUnits: Joi.number().integer().min(0).required().label('Available Units'),
    possessionDate: Joi.date().optional().allow(null, ''),

    images: Joi.array().items(Joi.string().uri({ allowRelative: true })).min(3).required()
        .messages({ 'array.min': 'At least 3 images are required' }),
    video: Joi.string().uri({ allowRelative: true }).optional().allow(null, ''),
    description: Joi.string().required().label('Description'),

    reraNumber: Joi.string().optional().allow(null, ''),
    amenities: Joi.array().items(Joi.string()).optional(),
    nearbyFacilities: Joi.array().items(Joi.string()).optional(),
});

export const updateBuilderProjectSchema = createBuilderProjectSchema
    .fork(
        ['projectName', 'city', 'area', 'propertyType', 'configuration', 'projectStatus', 'price', 'totalUnits', 'availableUnits', 'images', 'description'],
        (s) => s.optional()
    );

export const addUpdateSchema = Joi.object({
    text: Joi.string().required().max(1000).label('Update Text'),
    media: Joi.array().items(Joi.string().uri({ allowRelative: true })).optional().max(5).label('Update Media')
});
