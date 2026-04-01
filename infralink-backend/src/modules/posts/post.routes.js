import { Router } from 'express';
import * as postController from './post.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';

const router = Router();

// Retrieve user's specific posts
router.get('/user/:userId', postController.getUserPosts);

// Require auth beyond here
router.use(authMiddleware);

// Create standard post mapped to active user, using upload middleware
router.post('/', uploadSingle('image'), postController.createPost);

// Like a post
router.post('/:postId/like', postController.likePost);

// Comment on a post
router.post('/:postId/comment', postController.addComment);

// Delete a post
router.delete('/:postId', postController.deletePost);

export default router;
