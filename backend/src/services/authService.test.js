import { afterEach, describe, expect, it, vi } from 'vitest';
import User from '../models/User.js';
import * as models from '../models/index.js';
import * as userRepository from '../repositories/userRepository.js';
import * as passwordUtils from '../utils/passwordUtils.js';
import { UserType } from '../utils/enums.js';
import { bootstrapFirstSuperAdmin, createGoogleUser, getUserById, login, register, requestPasswordReset, resetPassword, verifyResetToken } from './authService.js';

describe('authService semantic errors - register slice', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws AUTH_EMAIL_ALREADY_EXISTS when email is already registered', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue({ id: 'existing-user' });

        await expect(register({
            email: 'ana@mail.com',
            password: '123456',
            name: 'Ana',
            userType: UserType.OWNER
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

describe('authService semantic errors - verify/reset token slice', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('verifyResetToken throws AUTH_RESET_TOKEN_INVALID_OR_EXPIRED when token record does not exist', async () => {
        vi.spyOn(models.UserPasswordReset, 'findOne').mockResolvedValue(null);

        await expect(verifyResetToken('missing-token')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'AUTH_RESET_TOKEN_INVALID_OR_EXPIRED',
            message: 'Token inválido o expirado'
        });
    });

    it('verifyResetToken throws AUTH_RESET_TOKEN_EXPIRED when token is expired', async () => {
        vi.spyOn(models.UserPasswordReset, 'findOne').mockResolvedValue({
            resetPasswordExpires: new Date(Date.now() - 60_000),
            user: { id: 'u-1', email: 'ana@mail.com' }
        });

        await expect(verifyResetToken('expired-token')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'AUTH_RESET_TOKEN_EXPIRED',
            message: 'El token ha expirado. Por favor solicita uno nuevo'
        });
    });

    it('resetPassword throws AUTH_PASSWORD_RESET_USER_NOT_FOUND when target user no longer exists', async () => {
        vi.spyOn(models.UserPasswordReset, 'findOne').mockResolvedValue({
            resetPasswordExpires: new Date(Date.now() + 60_000),
            user: { id: 'missing-user' }
        });
        vi.spyOn(User, 'scope').mockReturnValue({
            findByPk: vi.fn().mockResolvedValue(null)
        });

        await expect(resetPassword('valid-token', 'new-password-123')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 404,
            code: 'AUTH_PASSWORD_RESET_USER_NOT_FOUND',
            message: 'Usuario no encontrado'
        });
    });
});

describe('authService semantic errors - createGoogleUser slice', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws AUTH_GOOGLE_EMAIL_ALREADY_REGISTERED when email exists without googleId', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue({
            id: 'existing-user',
            googleId: null
        });

        await expect(createGoogleUser({
            googleId: 'g-1',
            email: 'ana@mail.com',
            name: 'Ana',
            picture: null
        }, 'tenant', '+5491111111111', '+5491111111111')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 409,
            code: 'AUTH_GOOGLE_EMAIL_ALREADY_REGISTERED',
            message: 'Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.'
        });
    });
});

describe('authService privileged role blocking — register', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        ['admin', UserType.ADMIN],
        ['super_admin', UserType.SUPER_ADMIN],
    ])('register throws AUTH_REGISTER_PRIVILEGED_ROLE for %s', async (_, role) => {
        await expect(register({
            email: 'test@mail.com',
            password: '123456',
            name: 'Test',
            phone: '111111111',
            userType: role
        })).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'AUTH_REGISTER_PRIVILEGED_ROLE',
            message: 'Tipo de usuario no válido para registro público'
        });
    });

    it('register passes for owner role', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        vi.spyOn(User, 'create').mockResolvedValue({
            id: 'u-owner-1',
            toJSON: () => ({ id: 'u-owner-1', userType: 'owner' })
        });

        await expect(register({
            email: 'owner@mail.com',
            password: '123456',
            name: 'Owner',
            phone: '111111111',
            userType: UserType.OWNER
        })).resolves.toBeDefined();
    });

    it('register passes for tenant role', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        vi.spyOn(User, 'create').mockResolvedValue({
            id: 'u-tenant-1',
            toJSON: () => ({ id: 'u-tenant-1', userType: 'tenant' })
        });

        await expect(register({
            email: 'tenant@mail.com',
            password: '123456',
            name: 'Tenant',
            phone: '111111111',
            userType: UserType.TENANT
        })).resolves.toBeDefined();
    });
});

describe('authService privileged role blocking — createGoogleUser', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        ['admin', UserType.ADMIN],
        ['super_admin', UserType.SUPER_ADMIN],
    ])('createGoogleUser throws AUTH_REGISTER_PRIVILEGED_ROLE for %s', async (_, role) => {
        await expect(createGoogleUser({
            googleId: 'g-1',
            email: 'test@mail.com',
            name: 'Test',
            picture: null
        }, role, '+5491111111111')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'AUTH_REGISTER_PRIVILEGED_ROLE',
            message: 'Tipo de usuario no válido para registro público'
        });
    });

    it('createGoogleUser passes for owner role', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        vi.spyOn(models.ActivityLog, 'create').mockResolvedValue({});
        vi.spyOn(User, 'create').mockResolvedValue({
            id: 'u-owner-g',
            toJSON: () => ({ id: 'u-owner-g', userType: 'owner' })
        });

        await expect(createGoogleUser({
            googleId: 'g-owner',
            email: 'owner@mail.com',
            name: 'Owner',
            picture: null
        }, UserType.OWNER, '+5491111111111')).resolves.toBeDefined();
    });

    it('createGoogleUser passes for tenant role', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        vi.spyOn(models.ActivityLog, 'create').mockResolvedValue({});
        vi.spyOn(User, 'create').mockResolvedValue({
            id: 'u-tenant-g',
            toJSON: () => ({ id: 'u-tenant-g', userType: 'tenant' })
        });

        await expect(createGoogleUser({
            googleId: 'g-tenant',
            email: 'tenant@mail.com',
            name: 'Tenant',
            picture: null
        }, UserType.TENANT, '+5491111111111')).resolves.toBeDefined();
    });
});

describe('authService bootstrapFirstSuperAdmin', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws BOOTSTRAP_INVALID_SECRET when provided secret does not match configured', async () => {
        await expect(bootstrapFirstSuperAdmin(
            { name: 'Admin', email: 'admin@test.com', password: 'secure123', phone: '3000000000' },
            'wrong-secret',
            'correct-secret'
        )).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 403,
            code: 'BOOTSTRAP_INVALID_SECRET',
            message: 'Secreto de bootstrap inválido'
        });
    });

    it('throws BOOTSTRAP_SUPERADMIN_EXISTS when a superadmin already exists', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue({ id: 'existing-super-admin', userType: 'super_admin' });

        await expect(bootstrapFirstSuperAdmin(
            { name: 'Admin', email: 'admin@test.com', password: 'secure123', phone: '3000000000' },
            'correct-secret',
            'correct-secret'
        )).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 409,
            code: 'BOOTSTRAP_SUPERADMIN_EXISTS',
            message: 'Ya existe un superadministrador'
        });
    });

    it('creates superadmin with hashed password and returns user+token', async () => {
        vi.spyOn(User, 'findOne').mockResolvedValue(null);
        const hashSpy = vi.spyOn(passwordUtils, 'hashPassword').mockResolvedValue('hashed-super-secure');
        vi.spyOn(User, 'create').mockResolvedValue({
            id: 'u-bootstrap-1',
            toJSON: () => ({
                id: 'u-bootstrap-1',
                name: 'Admin',
                email: 'admin@test.com',
                userType: 'super_admin',
                phone: '3000000000',
            })
        });

        const result = await bootstrapFirstSuperAdmin(
            { name: 'Admin', email: 'admin@test.com', password: 'secure123', phone: '3000000000' },
            'correct-secret',
            'correct-secret'
        );

        expect(hashSpy).toHaveBeenCalledWith('secure123');
        expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
            userType: 'super_admin',
            name: 'Admin',
            email: 'admin@test.com',
            password: 'hashed-super-secure',
            isActive: true,
            verificationStatus: 'verified',
        }));
        expect(result.user).toBeDefined();
        expect(result.token).toBeDefined();
        expect(result.user.password).toBeUndefined();
    });
});
