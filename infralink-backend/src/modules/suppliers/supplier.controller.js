import { getOrCreateProfile, updateProfile, getSupplierById, addProduct as addProductService } from './supplier.service.js';
import User from '../users/user.model.js';
import { supplierStep1Schema, supplierStep2Schema, supplierStep3Schema, supplierStep4Schema } from './supplier.validation.js';
import createError from 'http-errors';

export const getMyProfile = async (req, res, next) => {
    try {
        const profile = await getOrCreateProfile(req.user.id);
        res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
        next(error);
    }
};

export const submitStep1 = async (req, res, next) => {
    try {
        const data = req.body;
        if (req.files?.logo) data.logo = req.files.logo[0].path;

        const updatedProfile = await updateProfile(req.user.id, 1, data);
        res.status(200).json({ status: 'success', data: updatedProfile });
    } catch (error) { next(error); }
};

export const submitStep2 = async (req, res, next) => {
    try {
        const data = req.body;
        if (req.files?.businessLicense) {
            if (!data.verification) data.verification = {};
            data.verification.businessLicense = req.files.businessLicense[0].path;
        }

        const updatedProfile = await updateProfile(req.user.id, 2, data);
        res.status(200).json({ status: 'success', data: updatedProfile });
    } catch (error) { next(error); }
};

export const submitStep3 = async (req, res, next) => {
    try {
        const updatedProfile = await updateProfile(req.user.id, 3, req.body);
        res.status(200).json({ status: 'success', data: updatedProfile });
    } catch (error) { next(error); }
};

export const submitStep4 = async (req, res, next) => {
    try {
        const updatedProfile = await updateProfile(req.user.id, 4, req.body);
        await User.findByIdAndUpdate(req.user.id, { isVerified: true, role: 'supplier' });
        res.status(200).json({ status: 'success', data: updatedProfile });
    } catch (error) { next(error); }
};

export const verifySupplier = async (req, res, next) => {
    try {
        const profile = await getSupplierById(req.params.id);
        profile.verification.verifiedBadge = !profile.verification.verifiedBadge;
        await profile.save();
        res.status(200).json({ status: 'success', message: 'Verification toggled', data: profile });
    } catch (error) { next(error); }
};

export const requestQuote = async (req, res, next) => {
    try {
        const { id } = req.params; // Supplier profile ID
        const { message, products } = req.body;
        
        const supplier = await getSupplierById(id);
        
        // Normally this would create a Message or Notification Document
        // For now, we simulate success for the MVP
        // You could send an email using an EmailService here.
        
        res.status(200).json({ 
            status: 'success', 
            message: 'Quote request sent successfully! The supplier will contact you soon.' 
        });
    } catch (error) { next(error); }
};

export const rateSupplier = async (req, res, next) => {
    try {
        const { value, review } = req.body;
        const { id } = req.params;
        const { rateSupplier: rateSupplierService } = await import('./supplier.service.js');
        
        const result = await rateSupplierService(id, req.user.id, value, review);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) { next(error); }
};

export const getSupplier = async (req, res, next) => {
    try {
        const profile = await getSupplierById(req.params.id);
        res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
        next(error);
    }
};

export const addProduct = async (req, res, next) => {
    try {
        const product = await addProductService(req.user.id, req.body);
        res.status(200).json({ status: 'success', data: product });
    } catch (error) { next(error); }
};
