import { afterEach, describe, expect, it, vi } from 'vitest';
import * as propertyTypeController from './propertyTypeController.js';
import { PropertyType } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('propertyTypeController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standardized 404 contract when property type does not exist', async () => {
        vi.spyOn(PropertyType, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const res = createResponse();
        let capturedError;

        await propertyTypeController.getPropertyTypeById(req, res, (error) => {
            capturedError = error;
        });

        const statusCallsBeforeHandler = res.status.mock.calls.length;
        const jsonCallsBeforeHandler = res.json.mock.calls.length;

        errorHandler(capturedError, req, res, vi.fn());

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Property type not found',
            message: 'Property type not found',
            code: 'PROPERTY_TYPE_NOT_FOUND'
        });
    });

    it('delegates delete missing-resource flow to centralized handler', async () => {
        vi.spyOn(PropertyType, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '999' } };
        const res = createResponse();
        let capturedError;

        await propertyTypeController.deletePropertyType(req, res, (error) => {
            capturedError = error;
        });

        const statusCallsBeforeHandler = res.status.mock.calls.length;
        const jsonCallsBeforeHandler = res.json.mock.calls.length;

        errorHandler(capturedError, req, res, vi.fn());

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Property type not found',
            message: 'Property type not found',
            code: 'PROPERTY_TYPE_NOT_FOUND'
        });
    });

    it('delegates get-by-name missing-resource flow to centralized handler', async () => {
        vi.spyOn(PropertyType, 'findOne').mockResolvedValue(null);

        const req = { params: { name: 'missing-type' } };
        const res = createResponse();
        let capturedError;

        await propertyTypeController.getPropertyTypeByName(req, res, (error) => {
            capturedError = error;
        });

        const statusCallsBeforeHandler = res.status.mock.calls.length;
        const jsonCallsBeforeHandler = res.json.mock.calls.length;

        errorHandler(capturedError, req, res, vi.fn());

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Property type not found',
            message: 'Property type not found',
            code: 'PROPERTY_TYPE_NOT_FOUND'
        });
    });

    it('sanitizes unexpected get-by-name failures via centralized handler', async () => {
        vi.spyOn(PropertyType, 'findOne').mockRejectedValue(new Error('SequelizeConnectionRefusedError: db credentials leaked'));

        const req = { params: { name: 'apartment' } };
        const res = createResponse();
        let capturedError;

        await propertyTypeController.getPropertyTypeByName(req, res, (error) => {
            capturedError = error;
        });

        const statusCallsBeforeHandler = res.status.mock.calls.length;
        const jsonCallsBeforeHandler = res.json.mock.calls.length;

        errorHandler(capturedError, req, res, vi.fn());

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates delete foreign-key constraint errors to centralized handler with 409 contract', async () => {
        const destroy = vi.fn().mockRejectedValue({
            name: 'SequelizeForeignKeyConstraintError'
        });
        vi.spyOn(PropertyType, 'findByPk').mockResolvedValue({ destroy });

        const req = { params: { id: '12' } };
        const res = createResponse();
        let capturedError;

        await propertyTypeController.deletePropertyType(req, res, (error) => {
            capturedError = error;
        });

        const statusCallsBeforeHandler = res.status.mock.calls.length;
        const jsonCallsBeforeHandler = res.json.mock.calls.length;

        errorHandler(capturedError, req, res, vi.fn());

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Cannot delete property type',
            message: 'Cannot delete property type',
            code: 'PROPERTY_TYPE_IN_USE'
        });
    });

    it('sanitizes unexpected delete failures via centralized handler', async () => {
        const destroy = vi.fn().mockRejectedValue(new Error('driver timeout with internals'));
        vi.spyOn(PropertyType, 'findByPk').mockResolvedValue({ destroy });

        const req = { params: { id: '55' } };
        const res = createResponse();
        let capturedError;

        await propertyTypeController.deletePropertyType(req, res, (error) => {
            capturedError = error;
        });

        const statusCallsBeforeHandler = res.status.mock.calls.length;
        const jsonCallsBeforeHandler = res.json.mock.calls.length;

        errorHandler(capturedError, req, res, vi.fn());

        expect(capturedError).toBeInstanceOf(Error);
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
