import * as postService from './post.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { uploadBuffer } from '../../integrations/cloudinary.service.js';

export const createPost = async (req, res, next) => {
    try {
        const { 
            content, 
            projectName, 
            location,
            budgetRange,
            startDate,
            duration,
            requiredWorkers,
            contactOption,
            roleSpecificDetails 
        } = req.body;
        
        let parsedDetails = {};
        if (roleSpecificDetails) {
            try {
                parsedDetails = typeof roleSpecificDetails === 'string' 
                    ? JSON.parse(roleSpecificDetails) 
                    : roleSpecificDetails;
            } catch (e) {
                console.warn('[PostController] Failed to parse roleSpecificDetails:', e);
            }
        }
        
        let image = req.body.image;
        if (req.file && req.file.buffer) {
            const uploadResult = await uploadBuffer(req.file.buffer, { folder: 'infralink/posts' });
            image = uploadResult.url;
        }

        if (!content) {
            return sendError(res, 'Content is required', HTTP_STATUS.BAD_REQUEST);
        }

        const post = await postService.createPost(req.user._id, { 
            content, 
            image,
            projectName,
            location,
            budgetRange,
            startDate,
            duration,
            requiredWorkers: parseInt(requiredWorkers, 10) || 0,
            contactOption,
            roleSpecificDetails: parsedDetails
        });


        return sendCreated(res, post, 'Post created successfully');
    } catch (error) {
        next(error);
    }
};

export const likePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const result = await postService.toggleLikePost(postId, req.user._id);
        return sendSuccess(res, result, 'Post like toggled successfully');
    } catch (error) {
        next(error);
    }
};

export const addComment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;

        if (!text) {
             return sendError(res, 'Comment text is required', HTTP_STATUS.BAD_REQUEST);
        }

        const comment = await postService.addCommentToPost(postId, req.user._id, text);
        return sendCreated(res, comment, 'Comment added successfully');
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        await postService.removePost(postId, req.user._id);
        return sendSuccess(res, null, 'Post deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const getUserPosts = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const data = await postService.getPostsByUser(userId, page, limit);

        return sendSuccess(res, data.posts, 'Posts fetched successfully');
    } catch (error) {
        next(error);
    }
};

export const applyToPost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const application = await postService.applyToProject(postId, req.user._id);
        return sendCreated(res, application, 'Application sent successfully');
    } catch (error) {
        next(error);
    }
};

export const updateApplicationStatus = async (req, res, next) => {
    try {
        const { postId, applicationId } = req.params;
        const { status } = req.body;
        const result = await postService.updateApplicationStatus(postId, applicationId, status, req.user._id);
        return sendSuccess(res, result, `Application status updated to ${status}`);
    } catch (error) {
        next(error);
    }
};

