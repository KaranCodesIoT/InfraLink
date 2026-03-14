import { getPagination, buildPaginationMeta } from '../../src/utils/pagination.utils.js';

describe('Pagination Utils', () => {
    test('getPagination should return defaults for empty query', () => {
        const { page, limit, skip } = getPagination({});
        expect(page).toBe(1);
        expect(limit).toBe(20);
        expect(skip).toBe(0);
    });

    test('buildPaginationMeta should calculate totalPages correctly', () => {
        const meta = buildPaginationMeta(100, 1, 20);
        expect(meta.totalPages).toBe(5);
        expect(meta.hasNextPage).toBe(true);
        expect(meta.hasPrevPage).toBe(false);
    });
});
