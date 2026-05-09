import { afterEach, describe, expect, it, vi } from 'vitest';
import * as propertyController from './propertyController.js';
import { ActivityLog, Property } from '../models/index.js';
import * as propertyService from '../services/propertyService.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('propertyController ActivityLog parity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('creates property_updated activity when status returns to pending', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 'p-1', title: 'Depto', ownerId: 'u-1' });
        vi.spyOn(propertyService, 'updatePropertyWithAssociations').mockResolvedValue({});
        vi.spyOn(propertyService, 'findPropertyWithAssociations').mockResolvedValue({ id: 'p-1' });
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = { params: { id: 'p-1' }, body: { status: 'pending' }, userId: 'u-1' };
        const res = createRes();

        await propertyController.updateProperty(req, res);

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'property_updated',
            userId: 'u-1',
            propertyId: 'p-1'
        }));
        expect(res.json).toHaveBeenCalled();
    });
});
