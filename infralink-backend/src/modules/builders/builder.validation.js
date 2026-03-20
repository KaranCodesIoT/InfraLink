import Joi from 'joi';

export const step1Validation = Joi.object({
    companyName: Joi.string().trim().max(100).allow('', null),
    profileType: Joi.string().valid('Individual Contractor', 'Builder Company', 'Freelancer').required(),
    officeAddress: Joi.string().trim().required(),
    serviceAreas: Joi.array().items(Joi.string().trim()).min(1).required(),
    yearsOfExperience: Joi.number().min(0).max(100).required()
});

export const step2Validation = Joi.object({
    aadhaarNumber: Joi.string().trim().length(12).pattern(/^[0-9]+$/).required(),
    panNumber: Joi.string().trim().length(10).pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
    gstin: Joi.string().trim().allow('', null),
    reraRegistrationNumber: Joi.string().trim().allow('', null)
});

export const step3Validation = Joi.object({
    servicesOffered: Joi.array().items(Joi.string().trim()).min(1).required(),
    pricingModel: Joi.string().valid('per sq ft', 'hourly', 'fixed').required(),
    teamSize: Joi.number().min(1).required(),
    pastProjects: Joi.array().items(
        Joi.object({
            title: Joi.string().trim().required(),
            description: Joi.string().trim().allow('', null),
            location: Joi.string().trim().allow('', null),
            images: Joi.array().items(Joi.string().uri()).max(10).default([])
        })
    ).default([])
});
