import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors/AppError.js';
import { errorHandler } from './errorHandler.js';

const createResponse = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    res.headersSent = false;
    return res;
};

describe('errorHandler', () => {
    it('serializes classified AppError with standard shape and safe details', () => {
        const req = {};
        const res = createResponse();
        const next = vi.fn();
        const error = new AppError('Invalid payload', 400, 'VALIDATION_ERROR', {
            details: { field: 'email' }
        });

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid payload',
            message: 'Invalid payload',
            code: 'VALIDATION_ERROR',
            details: { field: 'email' }
        });
    });

    it('bridges legacy statusCode errors without forcing 500', () => {
        const req = {};
        const res = createResponse();
        const next = vi.fn();
        const legacyError = new Error('User not found');
        legacyError.statusCode = 404;

        errorHandler(legacyError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
            message: 'User not found',
            code: 'OPERATIONAL_ERROR'
        });
    });

    it('sanitizes unexpected errors as generic 500 response', () => {
        const req = {};
        const res = createResponse();
        const next = vi.fn();
        const error = new Error('SequelizeDatabaseError: SELECT * FROM users ...');
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
