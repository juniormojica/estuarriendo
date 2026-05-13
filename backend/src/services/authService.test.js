import { afterEach, describe, expect, it, vi } from 'vitest';
import User from '../models/User.js';
import * as userRepository from '../repositories/userRepository.js';
import * as passwordUtils from '../utils/passwordUtils.js';
import { getUserById, login, register, requestPasswordReset } from './authService.js';

describe('authService semantic errors - register slice', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws AUTH_EMAIL_ALREADY_EXISTS when email is already registered', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue({ id: 'existing-user' });

        await expect(register({
            email: 'ana@mail.com',
            password: '123456',
            name: 'Ana'
        })).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'AUTH_EMAIL_ALREADY_EXISTS',
            message: 'El usuario con este correo electrónico ya existe'
        });
    });
});

describe('authService semantic errors - login slice', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws AUTH_INVALID_CREDENTIALS when email does not exist', async () => {
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

        await expect(login('ana@mail.com', '123456')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 401,
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Correo electrónico o contraseña inválidos'
        });
    });

    it('throws AUTH_INVALID_CREDENTIALS when password-scope user cannot be loaded', async () => {
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
            id: 'u-1',
            isActive: true,
            toJSON: () => ({ id: 'u-1' })
        });
        vi.spyOn(User, 'scope').mockReturnValue({
            findOne: vi.fn().mockResolvedValue(null)
        });

        await expect(login('ana@mail.com', '123456')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 401,
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Correo electrónico o contraseña inválidos'
        });
    });

    it('throws AUTH_ACCOUNT_DISABLED when account is inactive', async () => {
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
            id: 'u-1',
            isActive: false,
            toJSON: () => ({ id: 'u-1' })
        });
        vi.spyOn(User, 'scope').mockReturnValue({
            findOne: vi.fn().mockResolvedValue({ id: 'u-1', password: 'hash' })
        });

        await expect(login('ana@mail.com', '123456')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 403,
            code: 'AUTH_ACCOUNT_DISABLED',
            message: 'La cuenta está desactivada'
        });
    });

    it('throws AUTH_INVALID_CREDENTIALS when password is invalid', async () => {
        vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
            id: 'u-1',
            isActive: true,
            toJSON: () => ({ id: 'u-1' })
        });
        vi.spyOn(User, 'scope').mockReturnValue({
            findOne: vi.fn().mockResolvedValue({ id: 'u-1', password: 'hash' })
        });
        vi.spyOn(passwordUtils, 'comparePassword').mockResolvedValue(false);

        await expect(login('ana@mail.com', 'wrong-password')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 401,
            code: 'AUTH_INVALID_CREDENTIALS',
            message: 'Correo electrónico o contraseña inválidos'
        });
    });
});

describe('authService semantic errors - getUserById slice', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws AUTH_USER_NOT_FOUND when user does not exist', async () => {
        vi.spyOn(userRepository, 'findById').mockResolvedValue(null);

        await expect(getUserById('missing-user')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 404,
            code: 'AUTH_USER_NOT_FOUND',
            message: 'Usuario no encontrado'
        });
    });
});

describe('authService semantic errors - requestPasswordReset slice', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws AUTH_PASSWORD_RESET_EMAIL_NOT_FOUND when email is not registered', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);

        await expect(requestPasswordReset('missing@mail.com')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 404,
            code: 'AUTH_PASSWORD_RESET_EMAIL_NOT_FOUND',
            message: 'El correo electrónico no está registrado en la aplicación. Escribe un correo registrado o procede a registrarte.'
        });
    });
});
