/**
 * Build a pagination object from query params.
 * @param {object} query - Express req.query
 * @returns {{ skip: number, limit: number, page: number, sort: string }}
 */
export const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const sort = query.sort || '-createdAt';
    return { page, limit, skip, sort };
};

/**
 * Build a pagination meta object for the response.
 * @param {number} total - Total number of documents
 * @param {number} page
 * @param {number} limit
 */
export const buildPaginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
});
