import { afterEach, describe, expect, it, vi } from 'vitest';
import * as favoriteController from './favoriteController.js';
import { Favorite, Property } from '../models/index.js';
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

describe('favoriteController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates addFavorite missing-property flow to centralized handler', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { userId: 1, params: { propertyId: '999' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            favoriteController.addFavorite,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propiedad no encontrada',
            message: 'Propiedad no encontrada',
            code: 'PROPERTY_NOT_FOUND'
        });
    });

    it('delegates addFavorite duplicate-favorite flow to centralized handler', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 5 });
        vi.spyOn(Favorite, 'findOne').mockResolvedValue({ id: 11, userId: 1, propertyId: 5 });

        const req = { userId: 1, params: { propertyId: '5' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            favoriteController.addFavorite,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Esta propiedad ya está en tus favoritos',
            message: 'Esta propiedad ya está en tus favoritos',
            code: 'FAVORITE_ALREADY_EXISTS'
        });
    });

    it('delegates unexpected checkFavorite errors to centralized handler internal-error contract', async () => {
        vi.spyOn(Favorite, 'findOne').mockRejectedValue(new Error('database exploded'));

        const req = { userId: 1, params: { propertyId: '5' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            favoriteController.checkFavorite,
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
