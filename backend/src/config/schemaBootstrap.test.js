import { describe, expect, it, vi } from 'vitest';
import { bootstrapDatabaseSchema, resolveSchemaBootstrapMode } from './schemaBootstrap.js';

describe('schema bootstrap mode resolution', () => {
    it('defaults to sync in development', () => {
        expect(resolveSchemaBootstrapMode({ nodeEnv: 'development', rawMode: undefined })).toBe('sync');
    });

    it('defaults to none outside development', () => {
        expect(resolveSchemaBootstrapMode({ nodeEnv: 'production', rawMode: undefined })).toBe('none');
    });

    it('uses valid explicit mode', () => {
        expect(resolveSchemaBootstrapMode({ nodeEnv: 'development', rawMode: ' migrate ' })).toBe('migrate');
    });
});

describe('bootstrapDatabaseSchema guards', () => {
    it('runs sync in development mode', async () => {
        const seedEnums = vi.fn(async () => undefined);
        const sync = vi.fn(async () => undefined);

        const result = await bootstrapDatabaseSchema({
            sequelize: { sync },
            seedEnums,
            logger: { log: vi.fn() },
            nodeEnv: 'development',
            rawMode: 'sync'
        });

        expect(result.action).toBe('sync');
        expect(seedEnums).toHaveBeenCalledTimes(1);
        expect(sync).toHaveBeenCalledWith({ force: false, alter: false });
    });

    it('blocks migrate mode without explicit startup approval', async () => {
        const previous = process.env.DB_RUN_MIGRATIONS_ON_STARTUP;
        process.env.DB_RUN_MIGRATIONS_ON_STARTUP = 'false';

        await expect(
            bootstrapDatabaseSchema({
                sequelize: { sync: vi.fn() },
                seedEnums: vi.fn(async () => undefined),
                runMigrations: vi.fn(async () => undefined),
                logger: { log: vi.fn() },
                nodeEnv: 'production',
                rawMode: 'migrate'
            })
        ).rejects.toThrow(/explicit migration execution/i);

        process.env.DB_RUN_MIGRATIONS_ON_STARTUP = previous;
    });
});
