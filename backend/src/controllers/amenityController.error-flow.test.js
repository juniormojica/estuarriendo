import { afterEach, describe, expect, it, vi } from 'vitest';
import * as amenityController from './amenityController.js';
import { Amenity } from '../models/index.js';
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

describe('amenityController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standardized 404 contract when amenity does not exist', async () => {
        vi.spyOn(Amenity, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res } = await runThroughErrorHandler(amenityController.getAmenityById, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Amenity not found',
            message: 'Amenity not found',
            code: 'AMENITY_NOT_FOUND'
        });
    });

    it('sanitizes unexpected errors with standardized 500 contract', async () => {
        vi.spyOn(Amenity, 'findByPk').mockRejectedValue(new Error('database exploded'));

        const req = { params: { id: '1' } };
        const { res } = await runThroughErrorHandler(amenityController.getAmenityById, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('returns standardized 404 contract when deleting a missing amenity', async () => {
        vi.spyOn(Amenity, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res } = await runThroughErrorHandler(amenityController.deleteAmenity, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Amenity not found',
            message: 'Amenity not found',
            code: 'AMENITY_NOT_FOUND'
        });
    });

    it('forwards getAllAmenities unexpected errors to centralized errorHandler', async () => {
        vi.spyOn(Amenity, 'findAll').mockRejectedValue(new Error('database exploded'));

        const req = {};
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            amenityController.getAllAmenities,
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

    it('forwards createAmenity unexpected errors to centralized errorHandler', async () => {
        vi.spyOn(Amenity, 'findOne').mockResolvedValue(null);
        vi.spyOn(Amenity, 'create').mockRejectedValue(new Error('insert exploded'));

        const req = { body: { name: 'Pool', icon: 'pool' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            amenityController.createAmenity,
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

    it('forwards updateAmenity unexpected errors to centralized errorHandler', async () => {
        const amenity = {
            update: vi.fn().mockRejectedValue(new Error('update exploded'))
        };
        vi.spyOn(Amenity, 'findByPk').mockResolvedValue(amenity);

        const req = { params: { id: '1' }, body: { name: 'Updated', icon: 'updated' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            amenityController.updateAmenity,
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

    it('returns standardized 404 contract when updating a missing amenity', async () => {
        vi.spyOn(Amenity, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' }, body: { name: 'Updated', icon: 'updated' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            amenityController.updateAmenity,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Amenity not found',
            message: 'Amenity not found',
            code: 'AMENITY_NOT_FOUND'
        });
    });
});
