import * as postService from './post.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.utils.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { uploadBuffer } from '../../integrations/cloudinary.service.js';

export const createPost = async (req, res, next) => {
    try {
        const { content, projectName, location } = req.body;

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
            location
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
