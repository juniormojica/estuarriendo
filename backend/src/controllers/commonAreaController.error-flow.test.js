import { afterEach, describe, expect, it, vi } from 'vitest';
import * as commonAreaController from './commonAreaController.js';
import { CommonArea } from '../models/index.js';
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

    const statusCallsBeforeHandler = res.status.mock.calls.length;
    const jsonCallsBeforeHandler = res.json.mock.calls.length;

    errorHandler(capturedError, req, res, vi.fn());
    return { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler };
};

describe('commonAreaController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standardized 404 contract when common area does not exist', async () => {
        vi.spyOn(CommonArea, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res } = await runThroughErrorHandler(commonAreaController.getCommonAreaById, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Common area not found',
            message: 'Common area not found',
            code: 'COMMON_AREA_NOT_FOUND'
        });
    });

    it('sanitizes unexpected errors with standardized 500 contract', async () => {
        vi.spyOn(CommonArea, 'findByPk').mockRejectedValue(new Error('database exploded'));

        const req = { params: { id: '1' } };
        const { res } = await runThroughErrorHandler(commonAreaController.getCommonAreaById, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('returns standardized 404 contract when deleting a missing common area', async () => {
        vi.spyOn(CommonArea, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res } = await runThroughErrorHandler(commonAreaController.deleteCommonArea, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Common area not found',
            message: 'Common area not found',
            code: 'COMMON_AREA_NOT_FOUND'
        });
    });

    it('forwards getAllCommonAreas unexpected errors to centralized errorHandler', async () => {
        vi.spyOn(CommonArea, 'findAll').mockRejectedValue(new Error('database exploded'));

        const req = {};
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            commonAreaController.getAllCommonAreas,
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

    it('forwards createCommonArea unexpected errors to centralized errorHandler', async () => {
        vi.spyOn(CommonArea, 'findOne').mockResolvedValue(null);
        vi.spyOn(CommonArea, 'create').mockRejectedValue(new Error('insert exploded'));

        const req = { body: { name: 'Pool', icon: 'pool' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            commonAreaController.createCommonArea,
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

    it('delegates createCommonArea missing-name validation to centralized handler', async () => {
        const req = { body: { icon: 'pool' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            commonAreaController.createCommonArea,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Common area name is required',
            message: 'Common area name is required',
            code: 'COMMON_AREA_NAME_REQUIRED'
        });
    });

    it('delegates createCommonArea duplicate-name conflicts to centralized handler', async () => {
        vi.spyOn(CommonArea, 'findOne').mockResolvedValue({ id: 10, name: 'Pool' });

        const req = { body: { name: 'Pool', icon: 'pool' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            commonAreaController.createCommonArea,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Common area already exists',
            message: 'Common area already exists',
            code: 'COMMON_AREA_ALREADY_EXISTS'
        });
    });

    it('forwards updateCommonArea unexpected errors to centralized errorHandler', async () => {
        const commonArea = {
            update: vi.fn().mockRejectedValue(new Error('update exploded'))
        };
        vi.spyOn(CommonArea, 'findByPk').mockResolvedValue(commonArea);

        const req = { params: { id: '1' }, body: { name: 'Updated', icon: 'updated' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            commonAreaController.updateCommonArea,
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

    it('returns standardized 404 contract when updating a missing common area', async () => {
        vi.spyOn(CommonArea, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' }, body: { name: 'Updated', icon: 'updated' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            commonAreaController.updateCommonArea,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Common area not found',
            message: 'Common area not found',
            code: 'COMMON_AREA_NOT_FOUND'
        });
    });
});
