import * as contractorService from './contractor.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export const saveStep1 = async (req, res, next) => {
    try {
        const profile = await contractorService.saveStep1(req.user._id, req.body);
        return sendSuccess(res, profile, 'Basic information saved successfully');
    } catch (error) {
        next(error);
    }
};

export const saveStep2 = async (req, res, next) => {
    try {
        console.log('[Step2] req.body:', req.body);
        console.log('[Step2] req.files:', req.files ? Object.keys(req.files) : 'none');
        // req.files will be populated by multer
        const profile = await contractorService.saveStep2(req.user._id, req.body, req.files);
        return sendSuccess(res, profile, 'KYC details saved and submitted for verification');
    } catch (error) {
        console.error('[Step2 ERROR]:', error.name, error.message);
        if (error.errors) {
            Object.entries(error.errors).forEach(([field, err]) => {
                console.error(`  Field "${field}": ${err.message} (value: ${err.value})`);
            });
        }
        next(error);
    }
};

export const saveStep3 = async (req, res, next) => {
    try {
        const profile = await contractorService.saveStep3(req.user._id, req.body);
        return sendSuccess(res, profile, 'Professional details saved. Onboarding complete.');
    } catch (error) {
        next(error);
    }
};

export const verifyContractor = async (req, res, next) => {
    try {
        const profile = await contractorService.verifyContractor(req.params.id);
        return sendSuccess(res, profile, 'Contractor verified successfully');
    } catch (error) {
        next(error);
    }
};

export const rejectContractor = async (req, res, next) => {
    try {
        const profile = await contractorService.rejectContractor(req.params.id);
        return sendSuccess(res, profile, 'Contractor rejected');
    } catch (error) {
        next(error);
    }
};

export const followContractor = async (req, res, next) => {
    try {
        const result = await contractorService.followContractor(req.params.id, req.user._id);
        return sendSuccess(res, result, result.message || 'Successfully followed contractor');
    } catch (error) {
        next(error);
    }
};

export const unfollowContractor = async (req, res, next) => {
    try {
        const result = await contractorService.unfollowContractor(req.params.id, req.user._id);
        return sendSuccess(res, result, result.message || 'Successfully unfollowed contractor');
    } catch (error) {
        next(error);
    }
};

export const rateContractor = async (req, res, next) => {
    try {
        const { value, review } = req.body;
        const result = await contractorService.rateContractor(req.params.id, req.user._id, value, review);
        return sendSuccess(res, result, 'Review submitted successfully');
    } catch (error) {
        next(error);
    }
};

export const getContractorProfile = async (req, res, next) => {
    try {
        const profile = await contractorService.getContractorById(req.params.id, req.user?._id);
        return sendSuccess(res, profile, 'Contractor profile fetched successfully');
    } catch (error) {
        next(error);
    }
};
export const getMyProfile = async (req, res, next) => {
    try {
        const profile = await contractorService.getContractorById(req.user._id, req.user._id);
        return sendSuccess(res, profile, 'Your contractor profile fetched successfully');
    } catch (error) {
        next(error);
    }
};
