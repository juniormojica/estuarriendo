import { afterEach, describe, expect, it, vi } from 'vitest';
import * as containerController from './containerController.js';
import containerService from '../services/containerService.js';
import { Property, Notification, ActivityLog, sequelize } from '../models/index.js';
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

describe('containerController rentCompleteContainer migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders 200 success on successful rent complete', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        const mockContainer = { id: 'c-1', title: 'Test Container', rentalMode: 'complete' };
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'rentCompleteContainer').mockResolvedValue(mockContainer);

        const req = { params: { id: 'c-1' } };
        const res = createResponse();
        const next = vi.fn();

        await containerController.rentCompleteContainer(req, res, next);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Pensión/apartamento alquilado por completo',
            data: mockContainer
        });
    });

    it('rolls back before forwarding service errors to 400 via badRequest', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'rentCompleteContainer').mockRejectedValue(new Error('service error'));

        const req = { params: { id: 'c-1' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.rentCompleteContainer(req, res, next);

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(rollback.mock.invocationCallOrder[0]).toBeLessThan(next.mock.invocationCallOrder[0]);

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'service error',
            message: 'service error',
            code: 'RENT_COMPLETE_FAILED'
        });
    });

    it('does not double-rollback when transaction is already finished', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: true });
        vi.spyOn(containerService, 'rentCompleteContainer').mockRejectedValue(new Error('service error'));

        const req = { params: { id: 'c-1' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.rentCompleteContainer(req, res, next);

        expect(rollback).not.toHaveBeenCalled();
        expect(commit).not.toHaveBeenCalled();

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'service error',
            message: 'service error',
            code: 'RENT_COMPLETE_FAILED'
        });
    });
});

describe('containerController changeRentalMode migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders 200 success on successful mode change to by_unit', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        const mockContainer = { id: 'c-1', title: 'Test Container', rentalMode: 'by_unit' };
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'changeToByUnitMode').mockResolvedValue(mockContainer);

        const req = { params: { id: 'c-1' }, body: { mode: 'by_unit' } };
        const res = createResponse();
        const next = vi.fn();

        await containerController.changeRentalMode(req, res, next);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Modo de alquiler cambiado a by_unit',
            data: mockContainer
        });
    });

    it('rolls back before forwarding service errors to 400 via badRequest', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'changeToByUnitMode').mockRejectedValue(new Error('service error'));

        const req = { params: { id: 'c-1' }, body: { mode: 'by_unit' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.changeRentalMode(req, res, next);

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(rollback.mock.invocationCallOrder[0]).toBeLessThan(next.mock.invocationCallOrder[0]);

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'service error',
            message: 'service error',
            code: 'RENTAL_MODE_CHANGE_FAILED'
        });
    });

    it('rolls back and forwards invalid mode (controller-thrown) error to 400 via badRequest', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });

        const req = { params: { id: 'c-1' }, body: { mode: 'complete' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.changeRentalMode(req, res, next);

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(rollback.mock.invocationCallOrder[0]).toBeLessThan(next.mock.invocationCallOrder[0]);

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Modo de alquiler inválido',
            message: 'Modo de alquiler inválido',
            code: 'RENTAL_MODE_CHANGE_FAILED'
        });
    });

    it('does not double-rollback when transaction is already finished', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: true });
        vi.spyOn(containerService, 'changeToByUnitMode').mockRejectedValue(new Error('service error'));

        const req = { params: { id: 'c-1' }, body: { mode: 'by_unit' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.changeRentalMode(req, res, next);

        expect(rollback).not.toHaveBeenCalled();
        expect(commit).not.toHaveBeenCalled();

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'service error',
            message: 'service error',
            code: 'RENTAL_MODE_CHANGE_FAILED'
        });
    });
});

describe('containerController deleteContainer migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rolls back and forwards notFound AppError when container does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'c-404' } };
        const res = await runThroughErrorHandler(containerController.deleteContainer, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Pensión/apartamento no encontrado',
            message: 'Pensión/apartamento no encontrado',
            code: 'CONTAINER_NOT_FOUND'
        });
    });

    it('rolls back and forwards forbidden AppError when not owner', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ ownerId: 'other-user' });

        const req = { params: { id: 'c-403' }, userId: 'current-user' };
        const res = await runThroughErrorHandler(containerController.deleteContainer, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No autorizado para eliminar esta pensión/apartamento',
            message: 'No autorizado para eliminar esta pensión/apartamento',
            code: 'FORBIDDEN'
        });
    });

    it('rolls back before forwarding unexpected failure to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'c-500' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.deleteContainer(req, res, next);

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
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'c-500' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.deleteContainer(req, res, next);

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

describe('containerController updateContainer migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rolls back and forwards notFound AppError when container does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'c-404' }, body: {} };
        const res = await runThroughErrorHandler(containerController.updateContainer, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Pensión/apartamento no encontrado',
            message: 'Pensión/apartamento no encontrado',
            code: 'CONTAINER_NOT_FOUND'
        });
    });

    it('rolls back and forwards forbidden AppError when not owner', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ ownerId: 'other-user' });

        const req = { params: { id: 'c-403' }, userId: 'current-user', body: {} };
        const res = await runThroughErrorHandler(containerController.updateContainer, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No autorizado para actualizar esta pensión/apartamento',
            message: 'No autorizado para actualizar esta pensión/apartamento',
            code: 'FORBIDDEN'
        });
    });

    it('rolls back before forwarding unexpected failure to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'c-500' }, body: {} };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.updateContainer(req, res, next);

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
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'c-500' }, body: {} };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.updateContainer(req, res, next);

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

describe('containerController createUnit migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders 201 success on successful unit creation', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        const mockUnit = { id: 'u-1', title: 'Habitación 1', parentId: 'c-1' };
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'createUnit').mockResolvedValue(mockUnit);

        const req = { params: { containerId: 'c-1' }, body: { title: 'Habitación 1' } };
        const res = createResponse();
        const next = vi.fn();

        await containerController.createUnit(req, res, next);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Habitación creada exitosamente',
            data: mockUnit
        });
    });

    it('rolls back before forwarding service errors to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(containerService, 'createUnit').mockRejectedValue(new Error('service error'));

        const req = { params: { containerId: 'c-1' }, body: { title: 'Habitación 1' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.createUnit(req, res, next);

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
        vi.spyOn(containerService, 'createUnit').mockRejectedValue(new Error('service error'));

        const req = { params: { containerId: 'c-1' }, body: { title: 'Habitación 1' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.createUnit(req, res, next);

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

describe('containerController rejectUnit migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns 400 when reason is missing without creating a transaction', async () => {
        const transactionSpy = vi.spyOn(sequelize, 'transaction');

        const req = { params: { id: 'u-1' }, body: {} };
        const res = await runThroughErrorHandler(containerController.rejectUnit, { req });

        expect(transactionSpy).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'El motivo de rechazo es requerido',
            message: 'El motivo de rechazo es requerido',
            code: 'BAD_REQUEST'
        });
    });

    it('rolls back and forwards notFound AppError when unit does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'u-404' }, body: { reason: 'Incomplete' } };
        const res = await runThroughErrorHandler(containerController.rejectUnit, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Habitación no encontrada',
            message: 'Habitación no encontrada',
            code: 'UNIT_NOT_FOUND'
        });
    });

    it('rolls back and forwards badRequest when property is not a unit', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 'u-1', parentId: null });

        const req = { params: { id: 'u-400' }, body: { reason: 'bad' } };
        const res = await runThroughErrorHandler(containerController.rejectUnit, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'La propiedad no es una habitación',
            message: 'La propiedad no es una habitación',
            code: 'PROPERTY_NOT_UNIT'
        });
    });

    it('renders success on successful unit rejection', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });

        const mockUnit = {
            id: 'u-1',
            title: 'Test Unit',
            parentId: 'c-1',
            status: 'pending',
            update: vi.fn().mockResolvedValue(undefined)
        };
        const mockContainer = { id: 'c-1', title: 'Test Container', ownerId: 'owner-1' };

        const findByPkSpy = vi.spyOn(Property, 'findByPk');
        findByPkSpy.mockResolvedValueOnce(mockUnit);
        findByPkSpy.mockResolvedValueOnce(mockContainer);

        vi.spyOn(Notification, 'create').mockResolvedValue(undefined);

        const req = { params: { id: 'u-1' }, body: { reason: 'Incomplete documentation' } };
        const res = createResponse();
        const next = vi.fn();

        await containerController.rejectUnit(req, res, next);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Habitación rechazada',
            data: mockUnit
        });
    });

    it('rolls back before forwarding unexpected failure to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'u-500' }, body: { reason: 'test' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.rejectUnit(req, res, next);

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
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'u-500' }, body: { reason: 'test' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.rejectUnit(req, res, next);

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

describe('containerController approveContainer migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rolls back and forwards notFound AppError when container does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'c-404' } };
        const res = await runThroughErrorHandler(containerController.approveContainer, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Pensión/apartamento no encontrado',
            message: 'Pensión/apartamento no encontrado',
            code: 'CONTAINER_NOT_FOUND'
        });
    });

    it('rolls back and forwards badRequest when property is not a container', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 'c-1', isContainer: false });

        const req = { params: { id: 'c-400' } };
        const res = await runThroughErrorHandler(containerController.approveContainer, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'La propiedad no es una pensión/apartamento',
            message: 'La propiedad no es una pensión/apartamento',
            code: 'PROPERTY_NOT_CONTAINER'
        });
    });

    it('rolls back before forwarding unexpected failure to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'c-500' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.approveContainer(req, res, next);

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
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'c-500' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.approveContainer(req, res, next);

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

    it('renders success on approving a container with pending units', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });

        const mockUnit = {
            id: 'u-1',
            title: 'Habitación 1',
            status: 'pending',
            update: vi.fn().mockResolvedValue(undefined)
        };
        const mockContainer = {
            id: 'c-1',
            title: 'Test Container',
            isContainer: true,
            status: 'pending',
            ownerId: 'owner-1',
            units: [mockUnit],
            update: vi.fn().mockResolvedValue(undefined)
        };

        vi.spyOn(Property, 'findByPk').mockResolvedValue(mockContainer);
        vi.spyOn(ActivityLog, 'create').mockResolvedValue(undefined);
        vi.spyOn(Notification, 'create').mockResolvedValue(undefined);

        const req = { params: { id: 'c-1' }, userId: 'admin-1' };
        const res = createResponse();
        const next = vi.fn();

        await containerController.approveContainer(req, res, next);

        expect(mockUnit.update).toHaveBeenCalledWith({
            status: 'approved',
            isVerified: true,
            reviewedAt: expect.any(Date),
            rejectionReason: null
        }, { transaction: expect.anything() });

        expect(mockContainer.update).toHaveBeenCalledWith({
            status: 'approved',
            isVerified: true,
            reviewedAt: expect.any(Date),
            rejectionReason: null
        }, { transaction: expect.anything() });

        expect(ActivityLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'property_approved',
                message: 'Container aprobado: Test Container',
                userId: 'admin-1',
                propertyId: 'c-1'
            }),
            expect.objectContaining({ transaction: expect.anything() })
        );

        expect(Notification.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'owner-1',
                type: 'property_approved',
                title: '¡Pensión aprobada!',
                propertyId: 'c-1'
            }),
            expect.objectContaining({ transaction: expect.anything() })
        );

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Pensión/apartamento y todas sus habitaciones aprobadas exitosamente',
            data: {
                container: mockContainer,
                approvedUnitsCount: 1
            }
        });
    });
});
