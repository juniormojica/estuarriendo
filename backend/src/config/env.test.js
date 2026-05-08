import { afterEach, describe, expect, it, vi } from 'vitest';

const BASE_ENV = {
    NODE_ENV: 'test',
    PORT: '3001',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'estuarriendo_test',
    DB_USER: 'postgres',
    DB_PASSWORD: 'postgres',
    JWT_SECRET: 'this_is_a_very_strong_secret_for_testing_12345',
    JWT_EXPIRES_IN: '7d',
    ALLOWED_ORIGINS: 'http://localhost:5173,http://localhost:3000',
};

const setEnv = (overrides = {}) => {
    process.env = {
        ...BASE_ENV,
        ...overrides,
    };
};

describe('config/env', () => {
    afterEach(async () => {
        vi.resetModules();
    });

    it('loads valid configuration with parsed contract', async () => {
        setEnv();

        const { env } = await import('./env.js');

        expect(env.port).toBe(3001);
        expect(env.nodeEnv).toBe('test');
        expect(env.db.name).toBe('estuarriendo_test');
        expect(env.jwt.expiresIn).toBe('7d');
        expect(env.allowedOrigins).toEqual(['http://localhost:5173', 'http://localhost:3000']);
    });

    it('fails fast when JWT_SECRET is missing', async () => {
        setEnv({ JWT_SECRET: '' });

        await expect(import('./env.js')).rejects.toThrow('Invalid required environment variable: JWT_SECRET');
    });

    it('fails fast when JWT_SECRET is weak or placeholder-like', async () => {
        setEnv({ JWT_SECRET: 'changeme' });
        await expect(import('./env.js')).rejects.toThrow('Invalid required environment variable: JWT_SECRET');

        vi.resetModules();
        setEnv({ JWT_SECRET: 'short-secret' });
        await expect(import('./env.js')).rejects.toThrow('Invalid required environment variable: JWT_SECRET');
    });

    it('never exposes secret values in startup validation errors', async () => {
        const leakedValue = 'short-secret-123';
        setEnv({ JWT_SECRET: leakedValue });

        try {
            await import('./env.js');
        } catch (error) {
            expect(error.message).toContain('JWT_SECRET');
            expect(error.message).not.toContain(leakedValue);
        }
    });

    it('in production mode, uses externally injected env and does not depend on repository .env', async () => {
        vi.resetModules();
        vi.doMock('dotenv', () => ({
            default: {
                config: vi.fn(() => ({ error: new Error('missing .env file') }))
            }
        }));

        setEnv({ NODE_ENV: 'production' });

        const { env } = await import('./env.js');
        expect(env.nodeEnv).toBe('production');

        vi.resetModules();
        vi.doMock('dotenv', () => ({
            default: {
                config: vi.fn(() => ({ error: new Error('missing .env file') }))
            }
        }));

        const leakedValue = 'weak-production-secret';
        setEnv({ NODE_ENV: 'production', JWT_SECRET: leakedValue });

        let thrownError;
        try {
            await import('./env.js');
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError.message).toContain('Invalid required environment variable: JWT_SECRET');
        expect(thrownError.message).not.toContain(leakedValue);
    });
});
