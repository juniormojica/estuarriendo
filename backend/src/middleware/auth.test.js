import { describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('./checkSubscription.js', () => ({
    default: vi.fn(async (_req, _res, next) => next())
}));

import authMiddleware from './auth.js';

const createResponse = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('authMiddleware contract', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rejects when authorization header is missing', async () => {
        const req = { headers: {} };
        const res = createResponse();
        const next = vi.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token de autorización requerido' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects when bearer format is malformed', async () => {
        const req = { headers: { authorization: 'Token abc' } };
        const res = createResponse();
        const next = vi.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Formato de token inválido. Use: Bearer <token>' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid token', async () => {
        const req = { headers: { authorization: 'Bearer invalid-token' } };
        const res = createResponse();
        const next = vi.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects expired token', async () => {
        const tokenError = new Error('El token ha expirado');
        const verifyTokenModule = await import('../utils/jwtUtils.js');
        vi.spyOn(verifyTokenModule, 'verifyToken').mockImplementation(() => {
            throw tokenError;
        });

        const req = { headers: { authorization: 'Bearer expired-token' } };
        const res = createResponse();
        const next = vi.fn();

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'El token ha expirado' });
        expect(next).not.toHaveBeenCalled();
    });

    it('accepts valid token and exposes auth identity contract', async () => {
        const verifyTokenModule = await import('../utils/jwtUtils.js');
        vi.spyOn(verifyTokenModule, 'verifyToken').mockReturnValue({ userId: 'user-123' });

        const req = { headers: { authorization: 'Bearer valid-token' } };
        const res = createResponse();
        const next = vi.fn();

        await authMiddleware(req, res, next);

        expect(req.auth).toEqual({ userId: 'user-123' });
        expect(req.userId).toBe('user-123');
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});
