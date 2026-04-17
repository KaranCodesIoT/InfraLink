import Post from './post.model.js';
import User from '../users/user.model.js';

export const createPost = async (userId, data) => {
    // Fetch requester role for denormalization
    const user = await User.findById(userId).select('role').lean();
    
    const post = new Post({
        user: userId,
        role: user?.role || 'unassigned',
        content: data.content,
        image: data.image || null,
        projectName: data.projectName || null,
        location: data.location || null,
        // Common Project Fields
        budgetRange: data.budgetRange || null,
        startDate: data.startDate || null,
        duration: data.duration || null,
        requiredWorkers: data.requiredWorkers || 0,
        contactOption: data.contactOption || null,
        // Role-Specific Details
        roleSpecificDetails: data.roleSpecificDetails || {},
        contentType: 'project_update'

    });
    await post.save();
    return await post.populate('user', 'name role profileImage avatar');
};

export const getPostsByUser = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.find({ user: userId })
            .populate('user', 'name role profileImage avatar')
            .populate('comments.user', 'name role profileImage avatar')
            .populate('applications.user', 'name role profileImage avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Post.countDocuments({ user: userId })
    ]);

    return {
        posts,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

export const toggleLikePost = async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
        post.likes.pull(userId);
    } else {
        post.likes.push(userId);
    }
    
    await post.save();
    return { liked: !hasLiked, likes: post.likes };
};

export const addCommentToPost = async (postId, userId, text) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    const newComment = {
        user: userId,
        text,
        createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Get the newly added comment and populate user
    const updatedPost = await Post.findById(postId).populate('comments.user', 'name role profileImage avatar');
    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    return addedComment;
};

export const removePost = async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    
    if (post.user.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this post');
    }
    
    await post.deleteOne();
    return true;
};

export const applyToProject = async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    if (!post.user) throw new Error('Post has no owner assigned');

    if (post.user.toString() === userId.toString()) {
        throw new Error('You cannot apply to your own project');
    }

    if (!post.applications) {
        post.applications = [];
    }

    const existingApp = post.applications.find(app => {
        if (!app || !app.user) return false;
        const appUserId = app.user._id ? app.user._id.toString() : app.user.toString();
        return appUserId === userId.toString();
    });

    if (existingApp) {
        throw new Error('You have already applied to this project');
    }

    post.applications.push({ user: userId, status: 'pending' });
    await post.save();

    const updatedPost = await Post.findById(postId).populate('applications.user', 'name role profileImage avatar');
    return updatedPost.applications[updatedPost.applications.length - 1];
};

export const updateApplicationStatus = async (postId, applicationId, status, ownerId) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    if (!post.user) throw new Error('Post has no owner assigned');

    if (post.user.toString() !== ownerId.toString()) {
        throw new Error('Unauthorized to manage these applications');
    }

    if (!post.applications) {
        throw new Error('No applications found for this post');
    }

    const application = post.applications.id(applicationId);
    if (!application) throw new Error('Application not found');

    application.status = status;
    await post.save();

    const updatedPost = await Post.findById(postId).populate('applications.user', 'name role profileImage avatar');
    return updatedPost.applications.id(applicationId);
};



