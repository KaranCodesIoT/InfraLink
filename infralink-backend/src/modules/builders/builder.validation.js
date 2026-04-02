import Joi from 'joi';

export const step1Validation = Joi.object({
    companyName: Joi.string().trim().max(100).allow('', null),
    profileType: Joi.string().valid('Individual Contractor', 'Builder Company', 'Freelancer', 'Builder').required(),
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

const pastProjectSchema = Joi.object({
    title: Joi.string().trim().required(),
    projectType: Joi.string().valid('Residential', 'Commercial', 'Interior', 'Infrastructure', 'Renovation', 'Other').default('Other'),
    location: Joi.string().trim().allow('', null),
    completionYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null),
    role: Joi.string().valid('Builder', 'Contractor', 'Architect', 'Supervisor', 'Other').default('Builder'),
    description: Joi.string().trim().required(),
    media: Joi.array().items(
        Joi.object({
            url: Joi.string().uri().required(),
            caption: Joi.string().trim().required(),
            category: Joi.string().valid('site_work', 'final_output', 'before_after', 'blueprint_document').default('final_output'),
            type: Joi.string().valid('image', 'video', 'document').default('image'),
        })
    ).max(20).default([]),
    legalDeclaration: Joi.object({
        contentOwnership: Joi.boolean().valid(true).required(),
        genuineProject: Joi.boolean().valid(true).required(),
        noCopyrightViolation: Joi.boolean().valid(true).required(),
        acceptsConsequences: Joi.boolean().valid(true).required(),
    }).required(),
});

export const step3Validation = Joi.object({
    servicesOffered: Joi.array().items(Joi.string().trim()).min(1).required(),
    pricingModel: Joi.string().valid('per sq ft', 'hourly', 'fixed').required(),
    teamSize: Joi.number().min(1).required(),
    pastProjects: Joi.array().items(pastProjectSchema).default([])
});

export const addProjectValidation = pastProjectSchema;
