import { afterEach, describe, expect, it, vi } from 'vitest';
import * as studentRequestController from './studentRequestController.js';
import { StudentRequest } from '../models/index.js';
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

describe('studentRequestController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates createStudentRequest required-field validation to standardized 400 contract', async () => {
        const req = { body: { studentId: 12 } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            studentRequestController.createStudentRequest,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'cityId is required',
            message: 'cityId is required',
            code: 'STUDENT_REQUEST_VALIDATION_ERROR'
        });
    });

    it('delegates getStudentRequestById missing-resource flow to standardized 404 contract', async () => {
        vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: '404' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            studentRequestController.getStudentRequestById,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Student request not found',
            message: 'Student request not found',
            code: 'STUDENT_REQUEST_NOT_FOUND'
        });
    });

    it('delegates getAllStudentRequests unexpected errors to centralized internal-error contract', async () => {
        vi.spyOn(StudentRequest, 'findAll').mockRejectedValue(new Error('findAll exploded'));

        const req = { query: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            studentRequestController.getAllStudentRequests,
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
