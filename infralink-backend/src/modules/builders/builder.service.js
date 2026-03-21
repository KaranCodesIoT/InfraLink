import BuilderProfile from './builderProfile.model.js';
import User from '../users/user.model.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { ERROR_CODES } from '../../constants/errorCodes.js';
import { uploadBuffer } from '../../integrations/cloudinary.service.js';

export const saveStep1 = async (userId, data) => {
    // Check if profile already exists
    let profile = await BuilderProfile.findOne({ user: userId });
    
    if (profile) {
        // Update existing profile (in case user went back to edit before completing onboarding)
        profile.companyName = data.companyName;
        profile.profileType = data.profileType;
        profile.officeAddress = data.officeAddress;
        profile.serviceAreas = data.serviceAreas;
        profile.yearsOfExperience = data.yearsOfExperience;
        
        // Only enforce step progress if moving forward
        if (profile.onboardingStepCompleted < 1) {
            profile.onboardingStepCompleted = 1;
        }
        await profile.save();
    } else {
        // Create new
        profile = await BuilderProfile.create({
            user: userId,
            companyName: data.companyName,
            profileType: data.profileType,
            officeAddress: data.officeAddress,
            serviceAreas: data.serviceAreas,
            yearsOfExperience: data.yearsOfExperience,
            onboardingStepCompleted: 1
        });
    }

    // Update user role to 'builder' if not already
    await User.findByIdAndUpdate(userId, { role: 'builder' });

    return profile;
};

export const saveStep2 = async (userId, data, files) => {
    let profile = await BuilderProfile.findOne({ user: userId });
    if (!profile) throw Object.assign(new Error('Complete Step 1 first'), { statusCode: 400 });

    // Upload files to Cloudinary if they exist
    const docs = profile.kycDetails?.documents || {};
    
    const uploadTasks = [];
    if (files.aadhaarCard) uploadTasks.push(uploadBuffer(files.aadhaarCard[0].buffer, { folder: 'kyc/aadhaar' }).then(res => docs.aadhaarCard = res.url));
    if (files.panCard) uploadTasks.push(uploadBuffer(files.panCard[0].buffer, { folder: 'kyc/pan' }).then(res => docs.panCard = res.url));
    if (files.gstCertificate) uploadTasks.push(uploadBuffer(files.gstCertificate[0].buffer, { folder: 'kyc/gst' }).then(res => docs.gstCertificate = res.url));
    if (files.reraCertificate) uploadTasks.push(uploadBuffer(files.reraCertificate[0].buffer, { folder: 'kyc/rera' }).then(res => docs.reraCertificate = res.url));

    await Promise.all(uploadTasks);

    // Mask Aadhaar: show only last 4 digits
    const maskedAadhaar = 'XXXX-XXXX-' + data.aadhaarNumber.slice(-4);

    profile.kycDetails = {
        aadhaarNumber: maskedAadhaar,
        panNumber: data.panNumber,
        gstin: data.gstin,
        reraRegistrationNumber: data.reraRegistrationNumber,
        documents: docs
    };

    if (profile.onboardingStepCompleted < 2) {
        profile.onboardingStepCompleted = 2;
    }
    
    await profile.save();

    // Update User KYC Status
    await User.findByIdAndUpdate(userId, { kycStatus: 'kyc_pending' });

    return profile;
};

export const saveStep3 = async (userId, data) => {
    let profile = await BuilderProfile.findOne({ user: userId });
    if (!profile) throw Object.assign(new Error('Complete previous steps first'), { statusCode: 400 });

    profile.professionalDetails = {
        servicesOffered: data.servicesOffered,
        pricingModel: data.pricingModel,
        teamSize: data.teamSize,
        pastProjects: data.pastProjects || profile.professionalDetails?.pastProjects || []
    };

    if (profile.onboardingStepCompleted < 3) {
        profile.onboardingStepCompleted = 3;
    }
    
    await profile.save();

    return profile;
};

// ─── Past Projects CRUD ───────────────────────────────────────────────────────

export const addPastProject = async (userId, projectData) => {
    let profile = await BuilderProfile.findOne({ user: userId });
    if (!profile) profile = await BuilderProfile.create({ user: userId });

    if (!profile.professionalDetails) profile.professionalDetails = {};
    if (!profile.professionalDetails.pastProjects) profile.professionalDetails.pastProjects = [];

    // Enforce legal declaration timestamp
    const project = {
        ...projectData,
        legalDeclaration: {
            ...projectData.legalDeclaration,
            declaredAt: new Date(),
        },
        verificationStatus: 'self_declared',
        createdAt: new Date(),
    };

    profile.professionalDetails.pastProjects.push(project);
    await profile.save();

    // Return the newly added project (last one in array)
    const addedProject = profile.professionalDetails.pastProjects[profile.professionalDetails.pastProjects.length - 1];
    return addedProject;
};

export const removePastProject = async (userId, projectId) => {
    const profile = await BuilderProfile.findOne({ user: userId });
    if (!profile) throw Object.assign(new Error('Builder profile not found'), { statusCode: 404 });

    const projectIndex = profile.professionalDetails.pastProjects.findIndex(
        p => p._id.toString() === projectId
    );
    if (projectIndex === -1) throw Object.assign(new Error('Project not found'), { statusCode: 404 });

    profile.professionalDetails.pastProjects.splice(projectIndex, 1);
    await profile.save();

    return { message: 'Project removed successfully' };
};

export const verifyBuilder = async (builderProfileId) => {
    const profile = await BuilderProfile.findById(builderProfileId);
    if (!profile) throw Object.assign(new Error('Builder Profile not found'), { statusCode: 404 });

    profile.isProfileActive = true;
    await profile.save();

    await User.findByIdAndUpdate(profile.user, { kycStatus: 'approved' });

    return profile;
};

export const followBuilder = async (builderProfileId, followerUserId) => {
    // Prevent self-follow
    const targetBuilder = await BuilderProfile.findById(builderProfileId);
    if (!targetBuilder) throw Object.assign(new Error('Builder not found'), { statusCode: 404 });
    if (targetBuilder.user.toString() === followerUserId.toString()) {
        throw Object.assign(new Error('You cannot follow your own profile'), { statusCode: 400 });
    }

    const updatedBuilder = await BuilderProfile.findOneAndUpdate(
        { _id: builderProfileId, followers: { $ne: followerUserId } },
        {
            $push: { followers: followerUserId },
            $inc: { followersCount: 1 }
        },
        { new: true }
    );
    
    if (!updatedBuilder) {
        const exists = await BuilderProfile.findById(builderProfileId);
        if (!exists) throw Object.assign(new Error('Builder not found'), { statusCode: 404 });
        return { message: 'Already following', isFollowing: true, followersCount: exists.followersCount };
    }

    await User.findByIdAndUpdate(
        followerUserId,
        { $addToSet: { followingBuilders: builderProfileId } }
    );

    return { isFollowing: true, followersCount: updatedBuilder.followersCount };
};

export const unfollowBuilder = async (builderProfileId, followerUserId) => {
    const updatedBuilder = await BuilderProfile.findOneAndUpdate(
        { _id: builderProfileId, followers: followerUserId },
        {
            $pull: { followers: followerUserId },
            $inc: { followersCount: -1 }
        },
        { new: true }
    );

    if (!updatedBuilder) {
        const exists = await BuilderProfile.findById(builderProfileId);
        if (!exists) throw Object.assign(new Error('Builder not found'), { statusCode: 404 });
        return { message: 'Not following', isFollowing: false, followersCount: exists.followersCount };
    }

    await User.findByIdAndUpdate(
        followerUserId,
        { $pull: { followingBuilders: builderProfileId } }
    );

    return { isFollowing: false, followersCount: updatedBuilder.followersCount };
};

export const rateBuilder = async (builderProfileId, userId, value, review) => {
    if (value < 1 || value > 5) throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });

    const builder = await BuilderProfile.findById(builderProfileId);
    if (!builder) throw Object.assign(new Error('Builder not found'), { statusCode: 404 });

    // Prevent self-rating
    if (builder.user.toString() === userId.toString()) {
        throw Object.assign(new Error('You cannot rate your own profile'), { statusCode: 400 });
    }

    const existingRatingIndex = builder.ratings.findIndex(r => r.user.toString() === userId.toString());

    if (existingRatingIndex >= 0) {
        builder.ratings[existingRatingIndex].value = value;
        if (review !== undefined) builder.ratings[existingRatingIndex].review = review;
        builder.ratings[existingRatingIndex].createdAt = Date.now();
    } else {
        builder.ratings.push({ user: userId, value, review });
    }

    builder.totalReviews = builder.ratings.length;
    const sum = builder.ratings.reduce((acc, curr) => acc + curr.value, 0);
    builder.averageRating = Math.round((sum / builder.totalReviews) * 10) / 10;

    await builder.save();

    return {
        averageRating: builder.averageRating,
        totalReviews: builder.totalReviews,
        userRating: builder.ratings.find(r => r.user.toString() === userId.toString())
    };
};
