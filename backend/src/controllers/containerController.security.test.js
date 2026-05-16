import { afterEach, describe, expect, it, vi } from 'vitest';
import * as containerController from './containerController.js';
import containerService from '../services/containerService.js';
import { Property } from '../models/index.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('containerController secondary leak guards', () => {
    afterEach(() => vi.restoreAllMocks());

    it('hides non-approved container from public getContainer', async () => {
        vi.spyOn(containerService, 'findContainerWithUnits').mockResolvedValue({
            id: 'c-1',
            status: 'pending',
            units: []
        });

        const req = { params: { id: 'c-1' } };
        const res = createRes();
        const next = vi.fn();

        await containerController.getContainer(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 404,
            code: 'CONTAINER_NOT_FOUND'
        }));
        expect(res.json).not.toHaveBeenCalled();
    });

    it('returns only approved units from public getContainer', async () => {
        const container = {
            id: 'c-1',
            status: 'approved',
            units: [
                { id: 'u-1', status: 'approved' },
                { id: 'u-2', status: 'pending' }
            ],
            dataValues: {}
        };
        vi.spyOn(containerService, 'findContainerWithUnits').mockResolvedValue(container);

        const req = { params: { id: 'c-1' } };
        const res = createRes();

        await containerController.getContainer(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(200);
        expect(container.dataValues.units).toEqual([{ id: 'u-1', status: 'approved' }]);
        expect(container.dataValues.unitStats).toEqual({ approved: 1, total: 1 });
    });

    it('hides units when parent container is not approved', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 'c-1', isContainer: true, status: 'rejected' });
        const findAllSpy = vi.spyOn(Property, 'findAll').mockResolvedValue([]);

        const req = { params: { containerId: 'c-1' } };
        const res = createRes();
        const next = vi.fn();

        await containerController.getContainerUnits(req, res, next);

        expect(findAllSpy).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 404,
            code: 'CONTAINER_NOT_FOUND'
        }));
    });

    it('queries only approved units for approved containers', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 'c-1', isContainer: true, status: 'approved' });
        const findAllSpy = vi.spyOn(Property, 'findAll').mockResolvedValue([]);

        const req = { params: { containerId: 'c-1' } };
        const res = createRes();

        await containerController.getContainerUnits(req, res, vi.fn());

        expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ parentId: 'c-1', status: 'approved' })
        }));
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
