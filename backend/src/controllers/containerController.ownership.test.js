import { afterEach, describe, expect, it, vi } from 'vitest';
import * as containerController from './containerController.js';
import containerService from '../services/containerService.js';
import { Property, sequelize } from '../models/index.js';
import User from '../models/User.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('containerController ownership authorization', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('blocks rentCompleteContainer for non-owner non-admin before service mutation', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 11, ownerId: 9, isContainer: true });
        vi.spyOn(User, 'findByPk').mockResolvedValue({ userType: 'owner' });
        const rentSpy = vi.spyOn(containerService, 'rentCompleteContainer').mockResolvedValue({ id: 11 });

        const req = { params: { id: '11' }, auth: { userId: 2 } };
        const res = createResponse();
        let capturedError;

        await containerController.rentCompleteContainer(req, res, (error) => {
            capturedError = error;
        });

        errorHandler(capturedError, req, res, vi.fn());

        expect(rentSpy).not.toHaveBeenCalled();
        expect(commit).not.toHaveBeenCalled();
        expect(rollback).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No autorizado para alquilar esta pensión/apartamento por completo',
            message: 'No autorizado para alquilar esta pensión/apartamento por completo',
            code: 'CONTAINER_ACCESS_FORBIDDEN'
        });
    });

    it('blocks updateUnitRentalStatus for non-owner non-admin', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk')
            .mockResolvedValueOnce({ id: 21, parentId: 12 })
            .mockResolvedValueOnce({ id: 12, ownerId: 9, isContainer: true });
        vi.spyOn(User, 'findByPk').mockResolvedValue({ userType: 'owner' });
        const updateSpy = vi.spyOn(containerService, 'updateUnitRentalStatus').mockResolvedValue({ id: 21 });

        const req = { params: { id: '21' }, body: { isRented: true }, auth: { userId: 2 } };
        const res = createResponse();
        let capturedError;

        await containerController.updateUnitRentalStatus(req, res, (error) => {
            capturedError = error;
        });

        errorHandler(capturedError, req, res, vi.fn());

        expect(updateSpy).not.toHaveBeenCalled();
        expect(commit).not.toHaveBeenCalled();
        expect(rollback).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No autorizado para modificar el estado de alquiler de esta habitación',
            message: 'No autorizado para modificar el estado de alquiler de esta habitación',
            code: 'UNIT_ACCESS_FORBIDDEN'
        });
    });
});
