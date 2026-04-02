import Joi from 'joi';

// Step 1: Basic Details, Location, and Categories
export const supplierStep1Schema = Joi.object({
  businessName: Joi.string().trim().required(),
  ownerName: Joi.string().trim().required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    pincode: Joi.string().required(),
    serviceAreas: Joi.array().items(Joi.string()).min(1).required()
  }).required(),
  categories: Joi.array().items(Joi.string().valid(
    'Cement Supplier',
    'Steel Supplier',
    'Sand / Aggregates',
    'Bricks / Blocks',
    'Tiles & Flooring',
    'Electrical Materials',
    'Plumbing Materials',
    'Furniture Supplier'
  )).min(1).required()
});

// Step 2: KYC, Verification & Trust
export const supplierStep2Schema = Joi.object({
  verification: Joi.object({
    gstNumber: Joi.string().trim().allow('', null).optional(),
    yearsOfExperience: Joi.number().min(0).default(0)
  }).required()
});

// Step 3: Products, Delivery, Pricing & Payment
export const supplierStep3Schema = Joi.object({
  products: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      pricePerUnit: Joi.number().min(0).required(),
      unit: Joi.string().required(),
      moq: Joi.number().min(1).required(),
      availableStock: Joi.number().min(0).default(0),
      deliveryTimeDays: Joi.number().min(0).required(),
    })
  ).optional(),
  logistics: Joi.object({
    deliveryAvailable: Joi.boolean().default(false),
    deliveryCharges: Joi.number().min(0).default(0),
    transportType: Joi.string().valid('Own Transport', 'Third-party').required(),
    sameDayDelivery: Joi.boolean().default(false)
  }).required(),
  paymentDetails: Joi.object({
    paymentMethods: Joi.array().items(
      Joi.string().valid('Cash', 'UPI', 'Bank Transfer', 'Online')
    ).min(1).required(),
    advanceRequiredPercentage: Joi.number().min(0).max(100).default(0)
  }).required()
});

// Step 4: Portfolio
export const supplierStep4Schema = Joi.object({
  portfolio: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      clientName: Joi.string().allow('', null).optional()
    })
  ).optional()
});
