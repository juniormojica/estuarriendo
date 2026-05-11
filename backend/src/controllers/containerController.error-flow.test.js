import { afterEach, describe, expect, it, vi } from 'vitest';
import * as containerController from './containerController.js';
import containerService from '../services/containerService.js';
import * as propertyService from '../services/propertyService.js';
import { Property, Notification, ActivityLog, sequelize, User } from '../models/index.js';
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

describe('containerController approveUnit migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rolls back and forwards notFound AppError when unit does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'u-404' } };
        const res = await runThroughErrorHandler(containerController.approveUnit, { req });

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
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 'u-400', parentId: null });

        const req = { params: { id: 'u-400' } };
        const res = await runThroughErrorHandler(containerController.approveUnit, { req });

        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'La propiedad no es una habitación',
            message: 'La propiedad no es una habitación',
            code: 'PROPERTY_NOT_UNIT'
        });
    });

    it('rolls back before forwarding unexpected failure to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db write failed'));

        const req = { params: { id: 'u-500' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.approveUnit(req, res, next);

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

        const req = { params: { id: 'u-500' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.approveUnit(req, res, next);

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

    it('renders success on approving a pending unit (individual notification)', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });

        const mockUnit = {
            id: 'u-1',
            title: 'Habitación 1',
            parentId: 'c-1',
            status: 'pending',
            update: vi.fn().mockResolvedValue(undefined)
        };
        const mockContainer = {
            id: 'c-1',
            title: 'Test Container',
            ownerId: 'owner-1',
            status: 'pending',
            units: [
                mockUnit,
                { id: 'u-2', status: 'pending' }
            ]
        };

        const findByPkSpy = vi.spyOn(Property, 'findByPk');
        findByPkSpy.mockResolvedValueOnce(mockUnit);
        findByPkSpy.mockResolvedValueOnce(mockContainer);

        vi.spyOn(Notification, 'create').mockResolvedValue(undefined);

        const req = { params: { id: 'u-1' } };
        const res = createResponse();
        const next = vi.fn();

        await containerController.approveUnit(req, res, next);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(Notification.create).toHaveBeenCalledTimes(1);
        expect(Notification.create).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'property_approved',
                title: 'Habitación aprobada',
                propertyId: 'u-1'
            }),
            expect.objectContaining({ transaction: expect.anything() })
        );
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Habitación aprobada exitosamente',
            data: { unit: mockUnit, containerApproved: false }
        });
    });

    it('auto-approves container and sends container notification when all units approved', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });

        const mockUnit = {
            id: 'u-1',
            title: 'Habitación 1',
            parentId: 'c-1',
            status: 'pending',
            update: vi.fn().mockResolvedValue(undefined)
        };
        const mockContainer = {
            id: 'c-1',
            title: 'Test Container',
            ownerId: 'owner-1',
            status: 'pending',
            update: vi.fn().mockResolvedValue(undefined),
            units: [
                mockUnit,
                { id: 'u-2', status: 'approved' }
            ]
        };

        const findByPkSpy = vi.spyOn(Property, 'findByPk');
        findByPkSpy.mockResolvedValueOnce(mockUnit);
        findByPkSpy.mockResolvedValueOnce(mockContainer);

        vi.spyOn(Notification, 'create').mockResolvedValue(undefined);

        const req = { params: { id: 'u-1' } };
        const res = createResponse();
        const next = vi.fn();

        await containerController.approveUnit(req, res, next);

        expect(mockContainer.update).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'approved' }),
            expect.objectContaining({ transaction: expect.anything() })
        );
        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        // Should send container-level notification, NOT unit-level
        expect(Notification.create).toHaveBeenCalledTimes(1);
        expect(Notification.create).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'property_approved',
                title: '¡Pensión aprobada!',
                propertyId: 'c-1'
            }),
            expect.objectContaining({ transaction: expect.anything() })
        );
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Habitación aprobada exitosamente',
            data: { unit: mockUnit, containerApproved: true }
        });
    });

    it('skips notification when unit was already approved', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });

        const mockUnit = {
            id: 'u-1',
            title: 'Habitación 1',
            parentId: 'c-1',
            status: 'approved',
            update: vi.fn().mockResolvedValue(undefined)
        };
        const mockContainer = {
            id: 'c-1',
            title: 'Test Container',
            ownerId: 'owner-1',
            status: 'pending',
            units: [
                mockUnit,
                { id: 'u-2', status: 'pending' }
            ]
        };

        const findByPkSpy = vi.spyOn(Property, 'findByPk');
        findByPkSpy.mockResolvedValueOnce(mockUnit);
        findByPkSpy.mockResolvedValueOnce(mockContainer);

        vi.spyOn(Notification, 'create');

        const req = { params: { id: 'u-1' } };
        const res = createResponse();
        const next = vi.fn();

        await containerController.approveUnit(req, res, next);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(Notification.create).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Habitación aprobada exitosamente',
            data: { unit: mockUnit, containerApproved: false }
        });
    });
});

describe('containerController createContainer migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders 201 success on successful container creation', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(propertyService, 'createPropertyWithAssociations').mockResolvedValue({ id: 'c-1', locationId: 1, ownerId: 'u-1' });
        vi.spyOn(containerService, 'findContainerWithUnits').mockResolvedValue({ id: 'c-1', title: 'Test Container' });
        vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const req = {
            userId: 'u-1',
            user: { name: 'Test Owner' },
            body: { title: 'Test Container', rentalMode: 'by_unit' }
        };
        const res = createResponse();
        const next = vi.fn();

        await containerController.createContainer(req, res, next);

        expect(commit).toHaveBeenCalledTimes(1);
        expect(rollback).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Pensión/apartamento creado exitosamente',
            data: { id: 'c-1', title: 'Test Container' }
        });
    });

    it('rolls back before forwarding unexpected failure to standardized 500 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);

        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit, finished: undefined });
        vi.spyOn(propertyService, 'createPropertyWithAssociations').mockRejectedValue(new Error('db write failed'));

        const req = {
            userId: 'u-1',
            user: { name: 'Test Owner' },
            body: { title: 'Test Container' }
        };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.createContainer(req, res, next);

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
        vi.spyOn(propertyService, 'createPropertyWithAssociations').mockRejectedValue(new Error('db write failed'));

        const req = {
            userId: 'u-1',
            user: { name: 'Test Owner' },
            body: { title: 'Test Container' }
        };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.createContainer(req, res, next);

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

describe('containerController adminCreateContainer migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns 403 forbidden when user is not admin', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1', userType: 'owner' });

        const req = { userId: 'u-1', body: { targetOwnerId: 'owner-1' } };
        const res = await runThroughErrorHandler(containerController.adminCreateContainer, { req });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permisos para realizar esta acción',
            message: 'No tienes permisos para realizar esta acción',
            code: 'FORBIDDEN'
        });
    });

    it('returns 400 when targetOwnerId is missing', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'admin-1', userType: 'admin' });

        const req = { userId: 'admin-1', body: {} };
        const res = await runThroughErrorHandler(containerController.adminCreateContainer, { req });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Se requiere el ID del propietario (targetOwnerId)',
            message: 'Se requiere el ID del propietario (targetOwnerId)',
            code: 'BAD_REQUEST'
        });
    });

    it('returns 404 when target owner does not exist', async () => {
        const findByPkSpy = vi.spyOn(User, 'findByPk');
        findByPkSpy.mockResolvedValueOnce({ id: 'admin-1', userType: 'admin' });
        findByPkSpy.mockResolvedValueOnce(null);

        const req = { userId: 'admin-1', body: { targetOwnerId: 'nonexistent' } };
        const res = await runThroughErrorHandler(containerController.adminCreateContainer, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propietario no encontrado',
            message: 'Propietario no encontrado',
            code: 'NOT_FOUND'
        });
    });

    it('returns 400 when target user is not an owner', async () => {
        const findByPkSpy = vi.spyOn(User, 'findByPk');
        findByPkSpy.mockResolvedValueOnce({ id: 'admin-1', userType: 'admin' });
        findByPkSpy.mockResolvedValueOnce({ id: 'student-1', userType: 'student' });

        const req = { userId: 'admin-1', body: { targetOwnerId: 'student-1' } };
        const res = await runThroughErrorHandler(containerController.adminCreateContainer, { req });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'El usuario seleccionado no tiene rol de propietario',
            message: 'El usuario seleccionado no tiene rol de propietario',
            code: 'BAD_REQUEST'
        });
    });

    it('delegates to createContainer with modified req and renders 201 success', async () => {
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ commit: vi.fn(), rollback: vi.fn() });
        vi.spyOn(propertyService, 'createPropertyWithAssociations').mockResolvedValue({ id: 'c-1', locationId: 1, ownerId: 'target-1' });
        vi.spyOn(containerService, 'findContainerWithUnits').mockResolvedValue({ id: 'c-1', title: 'Admin Created Container' });
        vi.spyOn(ActivityLog, 'create').mockResolvedValue({ id: 'log-1' });

        const findByPkSpy = vi.spyOn(User, 'findByPk');
        findByPkSpy.mockResolvedValueOnce({ id: 'admin-1', userType: 'admin' });
        findByPkSpy.mockResolvedValueOnce({ id: 'target-1', userType: 'owner' });

        const req = {
            userId: 'admin-1',
            user: { name: 'Admin' },
            body: {
                targetOwnerId: 'target-1',
                title: 'Admin Created Container',
                rentalMode: 'by_unit'
            }
        };
        const res = createResponse();
        const next = vi.fn();

        await containerController.adminCreateContainer(req, res, next);

        expect(req.userId).toBe('target-1');
        expect(req.body.targetOwnerId).toBeUndefined();

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Pensión/apartamento creado exitosamente',
            data: { id: 'c-1', title: 'Admin Created Container' }
        });
    });

    it('forwards unexpected errors to standardized 500 contract', async () => {
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('db read failed'));

        const req = { userId: 'admin-1', body: { targetOwnerId: 'target-1' } };
        const res = createResponse();
        let capturedError;
        const next = vi.fn((error) => {
            capturedError = error;
        });

        await containerController.adminCreateContainer(req, res, next);

        errorHandler(capturedError, req, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});
