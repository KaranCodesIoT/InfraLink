import multer from 'multer';
import path from 'path';
import { sendError } from '../utils/response.utils.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${path.extname(file.originalname)}`), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

export const handleMulterError = (err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        return sendError(res, err.message, HTTP_STATUS.BAD_REQUEST);
    }
    if (err) {
        return sendError(res, err.message, HTTP_STATUS.BAD_REQUEST);
    }
    next();
};
