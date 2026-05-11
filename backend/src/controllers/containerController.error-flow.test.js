import { afterEach, describe, expect, it, vi } from 'vitest';
import * as containerController from './containerController.js';
import containerService from '../services/containerService.js';
import { Property, sequelize } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = ({ headersSent = false } = {}) => {
    const res = {};
    res.headersSent = headersSent;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const runThroughErrorHandler = async (controllerAction, { req }) => {
    const res = createResponse();
    let capturedError;

    await controllerAction(req, res, (error) => {
        capturedError = error;
    });

    errorHandler(capturedError, req, res, vi.fn());
    return res;
};

describe('containerController read-slice migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 404 JSON when getContainer forwards notFound AppError', async () => {
        vi.spyOn(containerService, 'findContainerWithUnits').mockResolvedValue(null);

        const req = { params: { id: 'c-404' } };
        const res = await runThroughErrorHandler(containerController.getContainer, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Pensión/apartamento no encontrado',
            message: 'Pensión/apartamento no encontrado',
            code: 'CONTAINER_NOT_FOUND'
        });
    });

    it('maps unexpected model failure from getPendingContainers to standardized 500 contract', async () => {
        vi.spyOn(Property, 'findAll').mockRejectedValue(new Error('db read failed'));

        const req = {};
        const res = await runThroughErrorHandler(containerController.getPendingContainers, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('maps unexpected model failure from getContainerUnits to standardized 500 contract', async () => {
        vi.spyOn(Property, 'findAll').mockRejectedValue(new Error('db read failed'));

        const req = { params: { containerId: 'c-1' } };
        const res = await runThroughErrorHandler(containerController.getContainerUnits, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('containerController updateUnit migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rolls back and forwards notFound AppError when unit does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'u-404' }, body: {} };
        const res = await runThroughErrorHandler(containerController.updateUnit, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Habitación no encontrada',
            message: 'Habitación no encontrada',
            code: 'UNIT_NOT_FOUND'
        });
    });

    it('rolls back before forwarding unexpected failure to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'u-500' }, body: {} };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.updateUnit(req, res, next);

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(rollback.mock.invocationCallOrder[0]).toBeLessThan(next.mock.invocationCallOrder[0]);

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('containerController deleteUnit migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rolls back before forwarding service errors to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'deleteUnit').mockRejectedValue(new Error('service error'));

        const req = { params: { id: 'u-500' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.deleteUnit(req, res, next);

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(rollback.mock.invocationCallOrder[0]).toBeLessThan(next.mock.invocationCallOrder[0]);

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('containerController updateUnitRentalStatus migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rolls back before forwarding service errors to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'updateUnitRentalStatus').mockRejectedValue(new Error('service error'));

        const req = { params: { id: 'u-500' }, body: { isRented: true } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.updateUnitRentalStatus(req, res, next);

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(rollback.mock.invocationCallOrder[0]).toBeLessThan(next.mock.invocationCallOrder[0]);

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('does not double-rollback when transaction is already finished', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: true });
        vi.spyOn(containerService, 'updateUnitRentalStatus').mockRejectedValue(new Error('service error'));

        const req = { params: { id: 'u-500' }, body: { isRented: true } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.updateUnitRentalStatus(req, res, next);

        expect(rollback).not.toHaveBeenCalled();
        expect(commit).not.toHaveBeenCalled();

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});
