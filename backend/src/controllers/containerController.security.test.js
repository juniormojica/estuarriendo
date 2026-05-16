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
            contact: { email: 'secret@mail.com' },
            owner: { id: 'o-1', name: 'Owner', email: 'owner@mail.com' },
            units: [
                {
                    id: 'u-1',
                    status: 'approved',
                    contact: { phone: '12345' },
                    owner: { id: 'o-1', name: 'Owner', email: 'owner@mail.com' }
                },
                { id: 'u-2', status: 'pending' }
            ],
            dataValues: {},
            toJSON() {
                return {
                    id: this.id,
                    status: this.status,
                    contact: this.contact,
                    owner: this.owner,
                    units: this.dataValues.units
                };
            }
        };
        vi.spyOn(containerService, 'findContainerWithUnits').mockResolvedValue(container);

        const req = { params: { id: 'c-1' } };
        const res = createRes();

        await containerController.getContainer(req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(200);
        expect(container.dataValues.units).toEqual([
            expect.objectContaining({ id: 'u-1', status: 'approved' })
        ]);
        expect(container.dataValues.unitStats).toEqual({ approved: 1, total: 1 });

        const payload = res.json.mock.calls[0][0].data;
        expect(payload.contact).toBeUndefined();
        expect(payload.owner).toEqual({ id: 'o-1', name: 'Owner' });
        expect(payload.units[0].contact).toBeUndefined();
        expect(payload.units[0].owner).toEqual({ id: 'o-1', name: 'Owner' });
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
        const findAllSpy = vi.spyOn(Property, 'findAll').mockResolvedValue([
            {
                id: 'u-1',
                status: 'approved',
                contact: { email: 'unit@mail.com' },
                owner: { id: 'o-1', name: 'Owner', email: 'owner@mail.com' },
                toJSON() {
                    return {
                        id: this.id,
                        status: this.status,
                        contact: this.contact,
                        owner: this.owner
                    };
                }
            }
        ]);

        const req = { params: { containerId: 'c-1' } };
        const res = createRes();

        await containerController.getContainerUnits(req, res, vi.fn());

        expect(findAllSpy).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ parentId: 'c-1', status: 'approved' })
        }));
        expect(res.status).toHaveBeenCalledWith(200);

        const payload = res.json.mock.calls[0][0];
        expect(payload.data[0].contact).toBeUndefined();
        expect(payload.data[0].owner).toEqual({ id: 'o-1', name: 'Owner' });
    });
});
