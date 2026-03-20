import ContractorProfile from './contractorProfile.model.js';
import User from '../users/user.model.js';
import { uploadBuffer } from '../../integrations/cloudinary.service.js';

export const saveStep1 = async (userId, data) => {
    let profile = await ContractorProfile.findOne({ user: userId });
    
    if (profile) {
        profile.fullName = data.fullName;
        profile.phone = data.phone;
        profile.email = data.email;
        profile.address = data.address;
        profile.serviceAreas = data.serviceAreas;
        profile.experience = data.experience;
        
        if (profile.onboardingStepCompleted < 1) profile.onboardingStepCompleted = 1;
        await profile.save();
    } else {
        profile = await ContractorProfile.create({
            user: userId,
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            address: data.address,
            serviceAreas: data.serviceAreas,
            experience: data.experience,
            onboardingStepCompleted: 1
        });
    }

    await User.findByIdAndUpdate(userId, { role: 'contractor' });
    return profile;
};

export const saveStep2 = async (userId, data, files = {}) => {
    let profile = await ContractorProfile.findOne({ user: userId });
    if (!profile) throw Object.assign(new Error('Complete Step 1 first'), { statusCode: 400 });

    const docs = profile.kycDetails?.documents || {};
    
    // Only attempt uploads if Cloudinary is configured and files are provided
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';
    
    if (cloudinaryConfigured) {
        try {
            const uploadTasks = [];
            if (files.aadhaarCard) uploadTasks.push(uploadBuffer(files.aadhaarCard[0].buffer, { folder: 'kyc/contractors/aadhaar' }).then(res => docs.aadhaarCard = res.url));
            if (files.panCard) uploadTasks.push(uploadBuffer(files.panCard[0].buffer, { folder: 'kyc/contractors/pan' }).then(res => docs.panCard = res.url));
            if (files.gstCertificate) uploadTasks.push(uploadBuffer(files.gstCertificate[0].buffer, { folder: 'kyc/contractors/gst' }).then(res => docs.gstCertificate = res.url));
            await Promise.all(uploadTasks);
        } catch (uploadErr) {
            console.warn('Cloudinary upload failed, saving KYC data without documents:', uploadErr.message);
        }
    } else {
        console.warn('Cloudinary not configured — skipping file uploads for KYC');
    }

    const maskedAadhaar = data.aadhaarNumber ? 'XXXX-XXXX-' + data.aadhaarNumber.slice(-4) : null;

    // Set fields individually to avoid Mongoose subdocument setter crash
    if (!profile.kycDetails) profile.kycDetails = {};
    if (maskedAadhaar) profile.kycDetails.aadhaarLast4 = maskedAadhaar;
    if (data.panNumber) profile.kycDetails.panNumber = data.panNumber;
    if (data.gstin) profile.kycDetails.gstin = data.gstin;
    profile.kycDetails.documents = docs;

    if (profile.onboardingStepCompleted < 2) profile.onboardingStepCompleted = 2;
    profile.kycStatus = 'kyc_pending';
    
    await profile.save();
    await User.findByIdAndUpdate(userId, { kycStatus: 'pending' });

    return profile;
};

export const saveStep3 = async (userId, data) => {
    let profile = await ContractorProfile.findOne({ user: userId });
    if (!profile) throw Object.assign(new Error('Complete previous steps first'), { statusCode: 400 });

    profile.professionalDetails = {
        services: data.services,
        skillLevel: data.skillLevel,
        pricing: data.pricing,
        tools: data.tools,
        portfolio: data.portfolio || []
    };

    if (profile.onboardingStepCompleted < 3) profile.onboardingStepCompleted = 3;
    
    await profile.save();
    return profile;
};

export const verifyContractor = async (contractorProfileId) => {
    const profile = await ContractorProfile.findById(contractorProfileId);
    if (!profile) throw Object.assign(new Error('Contractor Profile not found'), { statusCode: 404 });

    profile.isProfileActive = true;
    profile.kycStatus = 'verified';
    await profile.save();

    await User.findByIdAndUpdate(profile.user, { kycStatus: 'approved' });
    return profile;
};

export const rejectContractor = async (contractorProfileId) => {
    const profile = await ContractorProfile.findById(contractorProfileId);
    if (!profile) throw Object.assign(new Error('Contractor Profile not found'), { statusCode: 404 });

    profile.isProfileActive = false;
    profile.kycStatus = 'rejected';
    await profile.save();

    await User.findByIdAndUpdate(profile.user, { kycStatus: 'rejected' });
    return profile;
};

export const followContractor = async (contractorProfileId, followerUserId) => {
    // Prevent self-follow
    const targetContractor = await ContractorProfile.findOne({ 
        $or: [{ _id: contractorProfileId }, { user: contractorProfileId }] 
    });
    if (!targetContractor) throw Object.assign(new Error('Contractor not found'), { statusCode: 404 });
    if (targetContractor.user.toString() === followerUserId.toString()) {
        throw Object.assign(new Error('You cannot follow your own profile'), { statusCode: 400 });
    }

    const updatedContractor = await ContractorProfile.findOneAndUpdate(
        { 
            $or: [{ _id: contractorProfileId }, { user: contractorProfileId }], 
            followers: { $ne: followerUserId } 
        },
        {
            $push: { followers: followerUserId },
            $inc: { followersCount: 1 }
        },
        { new: true }
    );
    
    if (!updatedContractor) {
        const exists = await ContractorProfile.findOne({ 
            $or: [{ _id: contractorProfileId }, { user: contractorProfileId }] 
        });
        if (!exists) throw Object.assign(new Error('Contractor not found'), { statusCode: 404 });
        return { message: 'Already following', isFollowing: true, followersCount: exists.followersCount };
    }

    await User.findByIdAndUpdate(
        followerUserId,
        { $addToSet: { followingContractors: contractorProfileId } }
    );

    return { isFollowing: true, followersCount: updatedContractor.followersCount };
};

export const unfollowContractor = async (contractorProfileId, followerUserId) => {
    const updatedContractor = await ContractorProfile.findOneAndUpdate(
        { 
            $or: [{ _id: contractorProfileId }, { user: contractorProfileId }], 
            followers: followerUserId 
        },
        {
            $pull: { followers: followerUserId },
            $inc: { followersCount: -1 }
        },
        { new: true }
    );

    if (!updatedContractor) {
        const exists = await ContractorProfile.findOne({ 
            $or: [{ _id: contractorProfileId }, { user: contractorProfileId }] 
        });
        if (!exists) throw Object.assign(new Error('Contractor not found'), { statusCode: 404 });
        return { message: 'Not following', isFollowing: false, followersCount: exists.followersCount };
    }

    await User.findByIdAndUpdate(
        followerUserId,
        { $pull: { followingContractors: contractorProfileId } }
    );

    return { isFollowing: false, followersCount: updatedContractor.followersCount };
};

export const rateContractor = async (contractorProfileId, userId, value, review) => {
    if (value < 1 || value > 5) throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });

    const contractor = await ContractorProfile.findOne({ 
        $or: [{ _id: contractorProfileId }, { user: contractorProfileId }] 
    });
    if (!contractor) throw Object.assign(new Error('Contractor not found'), { statusCode: 404 });

    // Prevent self-rating
    if (contractor.user.toString() === userId.toString()) {
        throw Object.assign(new Error('You cannot rate your own profile'), { statusCode: 400 });
    }

    const existingRatingIndex = contractor.ratings.findIndex(r => r.user.toString() === userId.toString());

    if (existingRatingIndex >= 0) {
        contractor.ratings[existingRatingIndex].value = value;
        if (review !== undefined) contractor.ratings[existingRatingIndex].review = review;
        contractor.ratings[existingRatingIndex].createdAt = Date.now();
    } else {
        contractor.ratings.push({ user: userId, value, review });
    }

    // pre-save hook handles recalculating averages
    await contractor.save();

    return {
        averageRating: contractor.averageRating,
        totalReviews: contractor.totalReviews,
        userRating: contractor.ratings.find(r => r.user.toString() === userId.toString())
    };
};

export const getContractorById = async (id, requesterUserId) => {
    const profile = await ContractorProfile.findById(id)
        .populate('user', '-password -refreshToken')
        .lean();
    
    if (!profile) {
        // Try finding by user ID in case the ID passed is user's ID
        const byUser = await ContractorProfile.findOne({ user: id })
            .populate('user', '-password -refreshToken')
            .lean();
        if (!byUser) throw Object.assign(new Error('Contractor profile not found'), { statusCode: 404 });
        
        const isFollowing = requesterUserId && byUser.followers 
            ? byUser.followers.some(f => f.toString() === requesterUserId.toString())
            : false;
            
        return { ...byUser, isFollowing };
    }

    const isFollowing = requesterUserId && profile.followers 
        ? profile.followers.some(f => f.toString() === requesterUserId.toString())
        : false;

    return { ...profile, isFollowing };
};
