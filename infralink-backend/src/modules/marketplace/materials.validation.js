import Joi from 'joi';

const bulkPricingSchema = Joi.object({
  minQty: Joi.number().required(),
  discountPrice: Joi.number().required()
});

const imageSchema = Joi.object({
  url: Joi.string().required(),
  isPrimary: Joi.boolean().default(false)
});

export const materialSchema = Joi.object({
  name: Joi.string().required().trim(),
  category: Joi.string().required().trim(),
  brand: Joi.string().allow('', null).trim(),
  description: Joi.object({
      short: Joi.string().required().trim(),
      detailed: Joi.string().allow('', null).trim()
  }).required(),
  price: Joi.number().required().min(0),
  unit: Joi.string().required().trim(),
  availableQuantity: Joi.number().required().min(0),
  moq: Joi.number().required().min(1),
  bulkPricing: Joi.array().items(bulkPricingSchema).optional(),
  location: Joi.object({
      warehouseCity: Joi.string().required().trim(),
      pincode: Joi.string().required().trim()
  }).required(),
  serviceAreas: Joi.array().items(Joi.string()).optional(),
  deliveryDetails: Joi.object({
      available: Joi.boolean().default(false),
      charges: Joi.number().min(0).default(0),
      time: Joi.string().trim()
  }).optional(),
  images: Joi.array().items(imageSchema).min(1).required(),
  status: Joi.string().valid('in_stock', 'limited', 'out_of_stock').default('in_stock'),
  urgencyTag: Joi.string().valid('urgent', 'best_price', 'limited_stock', 'none').default('none'),
  paymentOptions: Joi.array().items(Joi.string()).optional()
});
