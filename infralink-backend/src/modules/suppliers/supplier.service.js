import SupplierProfile from './supplierProfile.model.js';
import User from '../users/user.model.js';
import createError from 'http-errors';

export const getOrCreateProfile = async (userId) => {
    let profile = await SupplierProfile.findOne({ user: userId });
    
    if (!profile) {
        profile = await SupplierProfile.create({
            user: userId,
            businessName: '',
            ownerName: '',
            categories: [],
            location: { address: '', city: '', pincode: '', serviceAreas: [] },
            products: [],
            logistics: { deliveryAvailable: false, deliveryCharges: 0, transportType: 'Third-party', sameDayDelivery: false },
            paymentDetails: { paymentMethods: ['Cash'], advanceRequiredPercentage: 0 },
            portfolio: []
        });
    }
    
    return profile;
};

export const updateProfile = async (userId, step, data) => {
    const profile = await SupplierProfile.findOne({ user: userId });
    if (!profile) {
        throw createError(404, 'Supplier profile not found');
    }

    if (step === 1) {
        Object.assign(profile, {
            businessName: data.businessName,
            ownerName: data.ownerName,
            location: data.location,
            categories: data.categories
        });
        profile.onboardingStepCompleted = Math.max(profile.onboardingStepCompleted, 1);
    } 
    else if (step === 2) {
        Object.assign(profile.verification, {
            gstNumber: data.verification?.gstNumber || '',
            yearsOfExperience: data.verification?.yearsOfExperience || 0
        });
        profile.onboardingStepCompleted = Math.max(profile.onboardingStepCompleted, 2);
    }
    else if (step === 3) {
        Object.assign(profile, {
            products: data.products || profile.products,
            logistics: data.logistics,
            paymentDetails: data.paymentDetails
        });
        profile.onboardingStepCompleted = Math.max(profile.onboardingStepCompleted, 3);
    }
    else if (step === 4) {
        profile.portfolio = data.portfolio || profile.portfolio;
        profile.onboardingStepCompleted = 4;
        profile.isProfileActive = true;
    }

    await profile.save();
    return profile;
};

export const getSupplierById = async (supplierId) => {
    const profile = await SupplierProfile.findById(supplierId).populate('user', 'name email avatar phone isVerified');
    if (!profile) throw createError(404, 'Supplier not found');
    return profile;
};

export const rateSupplier = async (supplierProfileId, userId, value, review) => {
    if (value < 1 || value > 5) throw createError(400, 'Rating must be between 1 and 5');

    const profile = await SupplierProfile.findOne({ 
        $or: [{ _id: supplierProfileId }, { user: supplierProfileId }] 
    });
    if (!profile) throw createError(404, 'Supplier not found');

    if (profile.user.toString() === userId.toString()) {
        throw createError(400, 'You cannot rate your own profile');
    }

    const existingRatingIndex = profile.ratings.findIndex(r => r.user.toString() === userId.toString());

    if (existingRatingIndex >= 0) {
        profile.ratings[existingRatingIndex].value = value;
        if (review !== undefined) profile.ratings[existingRatingIndex].review = review;
        profile.ratings[existingRatingIndex].createdAt = Date.now();
    } else {
        profile.ratings.push({ user: userId, value, review });
    }

    await profile.save();

    return {
        averageRating: profile.reputation.averageRating,
        totalReviews: profile.totalReviews,
        userRating: profile.ratings.find(r => r.user.toString() === userId.toString())
    };
};

export const addProduct = async (userId, productData) => {
    const profile = await SupplierProfile.findOne({ user: userId });
    if (!profile) throw createError(404, 'Supplier profile not found');

    profile.products.push(productData);
    profile.isProfileActive = true; // Ensure profile is active if they add items
    await profile.save();
    return profile;
};
