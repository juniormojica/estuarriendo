import { afterEach, describe, expect, it, vi } from 'vitest';
import * as containerController from './containerController.js';
import { sequelize, ActivityLog } from '../models/index.js';
import * as propertyService from '../services/propertyService.js';
import containerService from '../services/containerService.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('containerController ActivityLog parity', () => {
    afterEach(() => vi.restoreAllMocks());

    it('logs container_submitted activity on successful creation', async () => {
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ commit: vi.fn(), rollback: vi.fn() });
        vi.spyOn(propertyService, 'createPropertyWithAssociations').mockResolvedValue({ id: 'c-1', locationId: 1, ownerId: 'u-1' });
        vi.spyOn(containerService, 'findContainerWithUnits').mockResolvedValue({ id: 'c-1', title: 'Container' });
        const activitySpy = vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = {
            userId: 'u-1',
            user: { name: 'Ana' },
            body: { images: ['https://cdn/image.png'], location: { cityId: 1 } }
        };
        const res = createRes();

        await containerController.createContainer(req, res);

        expect(activitySpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'container_submitted', userId: 'u-1' }));
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
