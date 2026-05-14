import { describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('../models/User.js', () => ({
    default: {
        findByPk: vi.fn()
    }
}));

import { requireAdmin, requireSuperAdmin, requireOwnerOrAdmin } from './role.js';
import User from '../models/User.js';
import { UserType } from '../utils/enums.js';

const createResponse = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('requireAdmin', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('rejects when req.auth is missing', async () => {
        const req = {};
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Autenticación requerida' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects when req.auth.userId is missing', async () => {
        const req = { auth: {} };
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Autenticación requerida' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects when user is not found in database', async () => {
        User.findByPk.mockResolvedValue(null);

        const req = { auth: { userId: 'nonexistent' } };
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects non-admin roles (owner)', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.OWNER });

        const req = { auth: { userId: 'u-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado. Se requieren permisos de administrador' });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects non-admin roles (tenant)', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.TENANT });

        const req = { auth: { userId: 'u-2' } };
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('allows admin role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.ADMIN });

        const req = { auth: { userId: 'admin-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('allows super_admin role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.SUPER_ADMIN });

        const req = { auth: { userId: 'super-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        User.findByPk.mockRejectedValue(new Error('DB connection lost'));

        const req = { auth: { userId: 'u-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
        expect(next).not.toHaveBeenCalled();
    });
});

describe('requireSuperAdmin', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('rejects when req.auth is missing', async () => {
        const req = {};
        const res = createResponse();
        const next = vi.fn();

        await requireSuperAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects admin role (not super_admin)', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.ADMIN });

        const req = { auth: { userId: 'admin-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireSuperAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('allows super_admin role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.SUPER_ADMIN });

        const req = { auth: { userId: 'super-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireSuperAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects owner role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.OWNER });

        const req = { auth: { userId: 'owner-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireSuperAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});

describe('requireOwnerOrAdmin', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('rejects when req.auth is missing', async () => {
        const req = {};
        const res = createResponse();
        const next = vi.fn();

        await requireOwnerOrAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects when user is not found', async () => {
        User.findByPk.mockResolvedValue(null);

        const req = { auth: { userId: 'nonexistent' } };
        const res = createResponse();
        const next = vi.fn();

        await requireOwnerOrAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects tenant role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.TENANT });

        const req = { auth: { userId: 'tenant-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireOwnerOrAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('allows owner role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.OWNER });

        const req = { auth: { userId: 'owner-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireOwnerOrAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('allows admin role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.ADMIN });

        const req = { auth: { userId: 'admin-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireOwnerOrAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('allows super_admin role', async () => {
        User.findByPk.mockResolvedValue({ userType: UserType.SUPER_ADMIN });

        const req = { auth: { userId: 'super-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireOwnerOrAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
        User.findByPk.mockRejectedValue(new Error('DB connection lost'));

        const req = { auth: { userId: 'u-1' } };
        const res = createResponse();
        const next = vi.fn();

        await requireOwnerOrAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });
});
