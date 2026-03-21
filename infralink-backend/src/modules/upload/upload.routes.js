import express from 'express';
import * as uploadController from './upload.controller.js';
import { uploadMultiple } from '../../middleware/upload.middleware.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

// Generic upload endpoint that accepts multiple files under the "media" field name
router.post(
    '/',
    authMiddleware,
    uploadMultiple('media', 10), // Allow up to 10 files
    uploadController.handleUpload
);

export default router;
