import Post from './post.model.js';

export const createPost = async (userId, data) => {
    const post = new Post({
        user: userId,
        content: data.content,
        image: data.image || null,
        projectName: data.projectName || null,
        location: data.location || null
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
