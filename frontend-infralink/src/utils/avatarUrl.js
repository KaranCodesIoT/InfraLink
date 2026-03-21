import { ENV } from '../config/env.js';

/**
 * Resolve an avatar URL to ensure it is absolute.
 * Handles: Cloudinary URLs (already absolute), new absolute local URLs,
 * and old relative URLs like `/uploads/avatars/...`.
 *
 * @param {string} url - The avatar URL from the database.
 * @returns {string} The resolved absolute URL.
 */
export function resolveAvatarUrl(url) {
    if (!url) return '';
    // Already an absolute URL (Cloudinary, http://localhost:5000/..., etc.)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
        return url;
    }
    // Relative URL like /uploads/avatars/xxx.jpg → prepend backend base
    const backendBase = ENV.SOCKET_URL || 'http://localhost:5000';
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
}
