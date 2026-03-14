import Joi from 'joi';

export const createProjectSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    job: Joi.string().optional(),
    budget: Joi.number().min(0),
    startDate: Joi.date(),
    endDate: Joi.date(),
    milestones: Joi.array().items(Joi.object({ title: Joi.string().required(), dueDate: Joi.date(), isCompleted: Joi.boolean() })),
});

export const updateProjectSchema = createProjectSchema.fork(['title'], s => s.optional()).append({
    status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled'),
    progress: Joi.number().min(0).max(100),
    spent: Joi.number().min(0),
});
