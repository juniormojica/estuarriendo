import { afterEach, describe, expect, it, vi } from 'vitest';
import * as cityController from './cityController.js';
import { City, Department, Location } from '../models/index.js';
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

describe('cityController deleteCity incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates delete missing-resource flow to centralized handler', async () => {
        vi.spyOn(City, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '999' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.deleteCity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'City not found',
            message: 'City not found',
            code: 'CITY_NOT_FOUND'
        });
    });

    it('delegates delete location-association conflict flow to centralized handler', async () => {
        vi.spyOn(City, 'findByPk').mockResolvedValue({ id: '10', destroy: vi.fn() });
        vi.spyOn(Location, 'count').mockResolvedValue(2);

        const req = { params: { id: '10' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.deleteCity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Cannot delete city with associated properties',
            message: 'Cannot delete city with associated properties',
            code: 'CITY_HAS_PROPERTIES',
            details: {
                locationCount: 2
            }
        });
    });

    it('delegates unexpected delete errors to centralized handler internal-error contract', async () => {
        vi.spyOn(City, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = { params: { id: '10' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.deleteCity,
            { req }
        );

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

    it('delegates create missing-department flow to centralized handler', async () => {
        vi.spyOn(Department, 'findByPk').mockResolvedValue(null);

        const req = {
            body: {
                name: 'Medellín',
                departmentId: 1,
                slug: 'medellin',
                isActive: true
            }
        };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.createCity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Department not found',
            message: 'Department not found',
            code: 'DEPARTMENT_NOT_FOUND'
        });
    });

    it('delegates create duplicate-slug conflict flow to centralized handler', async () => {
        vi.spyOn(Department, 'findByPk').mockResolvedValue({ id: 1 });
        vi.spyOn(City, 'findOne').mockResolvedValue({ id: 44, slug: 'medellin', departmentId: 1 });

        const req = {
            body: {
                name: 'Medellín',
                departmentId: 1,
                slug: 'medellin',
                isActive: true
            }
        };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.createCity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'City with this slug already exists in this department',
            message: 'City with this slug already exists in this department',
            code: 'CITY_SLUG_EXISTS'
        });
    });

    it('delegates unexpected create errors to centralized handler internal-error contract', async () => {
        vi.spyOn(Department, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = {
            body: {
                name: 'Medellín',
                departmentId: 1,
                slug: 'medellin',
                isActive: true
            }
        };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.createCity,
            { req }
        );

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

describe('cityController updateCity incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates update missing-city flow to centralized handler', async () => {
        vi.spyOn(City, 'findByPk').mockResolvedValueOnce(null);

        const req = {
            params: { id: '999' },
            body: { name: 'Medellín' }
        };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.updateCity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'City not found',
            message: 'City not found',
            code: 'CITY_NOT_FOUND'
        });
    });

    it('delegates update missing-department flow to centralized handler', async () => {
        vi.spyOn(City, 'findByPk').mockResolvedValueOnce({
            id: 10,
            departmentId: 1,
            slug: 'medellin',
            name: 'Medellín',
            isActive: true,
            update: vi.fn()
        });
        vi.spyOn(Department, 'findByPk').mockResolvedValue(null);

        const req = {
            params: { id: '10' },
            body: { departmentId: 2 }
        };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.updateCity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Department not found',
            message: 'Department not found',
            code: 'DEPARTMENT_NOT_FOUND'
        });
    });

    it('delegates update duplicate-slug conflict flow to centralized handler', async () => {
        vi.spyOn(City, 'findByPk')
            .mockResolvedValueOnce({
                id: 10,
                departmentId: 1,
                slug: 'old-slug',
                name: 'Old name',
                isActive: true,
                update: vi.fn()
            });
        vi.spyOn(City, 'findOne').mockResolvedValue({ id: 44, slug: 'medellin', departmentId: 1 });

        const req = {
            params: { id: '10' },
            body: { slug: 'medellin' }
        };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.updateCity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'City with this slug already exists in this department',
            message: 'City with this slug already exists in this department',
            code: 'CITY_SLUG_EXISTS'
        });
    });

    it('delegates unexpected update errors to centralized handler internal-error contract', async () => {
        vi.spyOn(City, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = {
            params: { id: '10' },
            body: { name: 'Medellín' }
        };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            cityController.updateCity,
            { req }
        );

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
