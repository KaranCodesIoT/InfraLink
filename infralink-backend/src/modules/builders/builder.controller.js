import * as builderService from './builder.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export const submitStep1 = async (req, res, next) => {
    try {
        const result = await builderService.saveStep1(req.user._id, req.body);
        return sendSuccess(res, result, 'Step 1: Basic Profile saved successfully');
    } catch (error) {
        next(error);
    }
};

export const submitStep2 = async (req, res, next) => {
    try {
        const result = await builderService.saveStep2(req.user._id, req.body, req.files || {});
        return sendSuccess(res, result, 'Step 2: KYC Details submitted successfully');
    } catch (error) {
        next(error);
    }
};

export const submitStep3 = async (req, res, next) => {
    try {
        const result = await builderService.saveStep3(req.user._id, req.body);
        return sendSuccess(res, result, 'Step 3: Professional Details saved successfully');
    } catch (error) {
        next(error);
    }
};

export const verifyBuilder = async (req, res, next) => {
    try {
        const result = await builderService.verifyBuilder(req.params.id);
        return sendSuccess(res, result, 'Builder profile verified successfully');
    } catch (error) {
        next(error);
    }
};

export const followBuilder = async (req, res, next) => {
    try {
        const result = await builderService.followBuilder(req.params.id, req.user._id);
        return sendSuccess(res, result, 'Successfully followed builder');
    } catch (error) {
        next(error);
    }
};

export const unfollowBuilder = async (req, res, next) => {
    try {
        const result = await builderService.unfollowBuilder(req.params.id, req.user._id);
        return sendSuccess(res, result, 'Successfully unfollowed builder');
    } catch (error) {
        next(error);
    }
};

export const rateBuilder = async (req, res, next) => {
    try {
        const { value, review } = req.body;
        const result = await builderService.rateBuilder(req.params.id, req.user._id, value, review);
        return sendSuccess(res, result, 'Successfully submitted rating');
    } catch (error) {
        next(error);
    }
};

