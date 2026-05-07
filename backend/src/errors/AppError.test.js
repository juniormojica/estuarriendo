import { describe, expect, it } from 'vitest';
import { AppError, badRequest, unauthorized, notFound, conflict } from './AppError.js';

describe('AppError', () => {
    it('builds the expected constructor shape', () => {
        const cause = new Error('db failed');
        const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
            details: { field: 'email' },
            cause
        });

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Validation failed');
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.isOperational).toBe(true);
        expect(error.details).toEqual({ field: 'email' });
        expect(error.cause).toBe(cause);
    });

    it('exposes stable default helper codes and statuses', () => {
        expect(badRequest('x').statusCode).toBe(400);
        expect(badRequest('x').code).toBe('BAD_REQUEST');

        expect(unauthorized('x').statusCode).toBe(401);
        expect(unauthorized('x').code).toBe('UNAUTHORIZED');

        expect(notFound('x').statusCode).toBe(404);
        expect(notFound('x').code).toBe('NOT_FOUND');

        expect(conflict('x').statusCode).toBe(409);
        expect(conflict('x').code).toBe('CONFLICT');
    });

    it('allows overriding helper code for domain-specific contracts', () => {
        const error = notFound('User not found', { code: 'USER_NOT_FOUND' });

        expect(error.statusCode).toBe(404);
        expect(error.code).toBe('USER_NOT_FOUND');
        expect(error.message).toBe('User not found');
    });
});
