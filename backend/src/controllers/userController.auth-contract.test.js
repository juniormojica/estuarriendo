import { afterEach, describe, expect, it, vi } from 'vitest';
import * as userController from './userController.js';
import * as userService from '../services/userService.js';

const createResponse = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe('userController updateUser auth contract', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('allows authenticated self-update via req.auth.userId', async () => {
        const updatedUser = { id: 'u-1', name: 'Ana Updated' };
        const updateSpy = vi.spyOn(userService, 'updateUser').mockResolvedValue(updatedUser);

        const req = {
            params: { id: 'u-1' },
            body: { name: 'Ana Updated', userType: 'admin' },
            auth: { userId: 'u-1' }
        };
        const res = createResponse();
        const next = vi.fn();

        await userController.updateUser(req, res, next);

        expect(updateSpy).toHaveBeenCalledWith('u-1', { name: 'Ana Updated' });
        expect(res.json).toHaveBeenCalledWith(updatedUser);
        expect(next).not.toHaveBeenCalled();
    });

    it('forbids cross-user update and no longer depends on req.user', async () => {
        const updateSpy = vi.spyOn(userService, 'updateUser').mockResolvedValue({ id: 'u-2' });

        const req = {
            params: { id: 'u-2' },
            body: { name: 'Other User' },
            auth: { userId: 'u-1' }
        };
        const res = createResponse();
        const next = vi.fn();

        await userController.updateUser(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toMatchObject({
            statusCode: 403,
            code: 'USER_UPDATE_FORBIDDEN',
            message: 'No tienes permiso para actualizar este perfil'
        });
    });

    it('rejects update when req.auth is missing', async () => {
        const updateSpy = vi.spyOn(userService, 'updateUser').mockResolvedValue({ id: 'u-1' });

        const req = {
            params: { id: 'u-1' },
            body: { name: 'Ana Updated' }
        };
        const res = createResponse();
        const next = vi.fn();

        await userController.updateUser(req, res, next);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(updateSpy).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toMatchObject({
            statusCode: 401,
            code: 'USER_UPDATE_UNAUTHENTICATED',
            message: 'No autenticado'
        });
    });
});
