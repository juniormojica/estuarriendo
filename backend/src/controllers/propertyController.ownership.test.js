import { afterEach, describe, expect, it, vi } from 'vitest';
import * as propertyController from './propertyController.js';
import { Property } from '../models/index.js';
import User from '../models/User.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const runThroughErrorHandler = async (controllerAction, req) => {
    const res = createResponse();
    let capturedError;

    await controllerAction(req, res, (error) => {
        capturedError = error;
    });

    errorHandler(capturedError, req, res, vi.fn());
    return res;
};

describe('propertyController ownership authorization', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fails closed on createProperty when auth context is missing', async () => {
        const res = await runThroughErrorHandler(propertyController.createProperty, {
            body: {}
        });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Autenticación requerida',
            message: 'Autenticación requerida',
            code: 'AUTH_REQUIRED'
        });
    });

    it('blocks updateProperty when non-owner and non-admin attempts mutation', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ id: 7, ownerId: 99 });
        vi.spyOn(User, 'findByPk').mockResolvedValue({ userType: 'owner' });

        const res = await runThroughErrorHandler(propertyController.updateProperty, {
            params: { id: '7' },
            body: {},
            auth: { userId: 2 }
        });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: 'No tienes permiso para modificar esta propiedad',
            message: 'No tienes permiso para modificar esta propiedad',
            code: 'PROPERTY_ACCESS_FORBIDDEN'
        });
    });
});
