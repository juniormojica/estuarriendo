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

    it('hides non-approved property detail with 404', async () => {
        vi.spyOn(propertyService, 'findPropertyWithAssociations').mockResolvedValue({
            id: 'p-1',
            status: 'pending'
        });

        const req = { params: { id: 'p-1' }, query: {} };
        const res = createRes();
        const next = vi.fn();

        await propertyController.getPropertyById(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 404,
            code: 'PROPERTY_NOT_FOUND'
        }));
        expect(res.json).not.toHaveBeenCalled();
    });

    it('sanitizes contact and owner sensitive fields in public detail', async () => {
        vi.spyOn(propertyService, 'findPropertyWithAssociations').mockResolvedValue({
            id: 'p-1',
            status: 'approved',
            isFeatured: false,
            increment: vi.fn(),
            toJSON: () => ({
                id: 'p-1',
                status: 'approved',
                contact: { email: 'secret@mail.com', phone: '123' },
                owner: { id: 'o-1', name: 'Owner', email: 'owner@mail.com', phone: '999' }
            })
        });

        const req = { params: { id: 'p-1' }, query: {} };
        const res = createRes();

        await propertyController.getPropertyById(req, res, vi.fn());

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            id: 'p-1',
            owner: { id: 'o-1', name: 'Owner' }
        }));

        const payload = res.json.mock.calls[0][0];
        expect(payload.contact).toBeUndefined();
        expect(payload.owner.email).toBeUndefined();
        expect(payload.owner.phone).toBeUndefined();
    });

    it('forces approved-only and sanitizes owner listing by user', async () => {
        vi.spyOn(propertyService, 'findPropertiesWithAssociations').mockResolvedValue({
            rows: [{
                id: 'p-1',
                status: 'approved',
                contact: { whatsapp: '+57 3000000000' },
                owner: { id: 'u-1', name: 'Owner', email: 'owner@mail.com' }
            }],
            count: 1
        });

        const req = { params: { userId: 'u-1' } };
        const res = createRes();

        await propertyController.getUserProperties(req, res, vi.fn());

        expect(propertyService.findPropertiesWithAssociations).toHaveBeenCalledWith(
            expect.objectContaining({ ownerId: 'u-1', status: 'approved' }),
            expect.any(Object)
        );

        const payload = res.json.mock.calls[0][0];
        expect(payload.data[0].contact).toBeUndefined();
        expect(payload.data[0].owner).toEqual({ id: 'u-1', name: 'Owner' });
    });
});
