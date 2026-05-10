import { afterEach, describe, expect, it, vi } from 'vitest';
import * as propertyReportController from './propertyReportController.js';
import { ContactUnlock, PropertyReport } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
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

    const statusCallsBeforeHandler = res.status.mock.calls.length;
    const jsonCallsBeforeHandler = res.json.mock.calls.length;

    errorHandler(capturedError, req, res, vi.fn());
    return { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler };
};

describe('propertyReportController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates createPropertyReport required-fields validation to standardized 400 contract', async () => {
        const req = { body: { reporterId: 3, propertyId: 10 } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            propertyReportController.createPropertyReport,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Se requiere reporterId, propertyId y reason',
            message: 'Se requiere reporterId, propertyId y reason',
            code: 'PROPERTY_REPORT_REQUIRED_FIELDS'
        });
    });

    it('delegates createPropertyReport unlock-required flow to standardized 403 contract', async () => {
        vi.spyOn(ContactUnlock, 'findOne').mockResolvedValue(null);

        const req = { body: { reporterId: 3, propertyId: 10, reason: 'already_rented' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            propertyReportController.createPropertyReport,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Debes desbloquear el contacto antes de reportar la propiedad',
            message: 'Debes desbloquear el contacto antes de reportar la propiedad',
            code: 'PROPERTY_REPORT_UNLOCK_REQUIRED'
        });
    });

    it('rolls back and delegates confirmPropertyReport missing-resource flow to standardized 404 contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit });
        vi.spyOn(PropertyReport, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' }, body: { adminId: 99 } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            propertyReportController.confirmPropertyReport,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Reporte no encontrado',
            message: 'Reporte no encontrado',
            code: 'PROPERTY_REPORT_NOT_FOUND'
        });
    });

    it('rolls back and delegates confirmPropertyReport unexpected errors to centralized internal-error contract', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        const commit = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback, commit });
        vi.spyOn(PropertyReport, 'findByPk').mockRejectedValue(new Error('query exploded'));

        const req = { params: { id: '9' }, body: { adminId: 99 } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            propertyReportController.confirmPropertyReport,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(rollback).toHaveBeenCalledTimes(1);
        expect(commit).not.toHaveBeenCalled();
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});
