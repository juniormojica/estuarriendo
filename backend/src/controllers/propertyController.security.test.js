import { afterEach, describe, expect, it, vi } from 'vitest';
import * as propertyController from './propertyController.js';
import * as propertyService from '../services/propertyService.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('propertyController security guards', () => {
    afterEach(() => vi.restoreAllMocks());

    it('forces approved-only listing even when status=all is requested', async () => {
        vi.spyOn(propertyService, 'findPropertiesWithAssociations').mockResolvedValue({ rows: [], count: 0 });

        const req = { query: { status: 'all' } };
        const res = createRes();

        await propertyController.getAllProperties(req, res, vi.fn());

        expect(propertyService.findPropertiesWithAssociations).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'approved' }),
            expect.any(Object)
        );
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true, data: [], count: 0 })
        );
    });
});
