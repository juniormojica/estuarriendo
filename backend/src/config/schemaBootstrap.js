import { env } from './env.js';

const VALID_MODES = new Set(['sync', 'migrate', 'none']);

const normalize = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

export const resolveSchemaBootstrapMode = ({ nodeEnv = env.nodeEnv, rawMode = process.env.DB_SCHEMA_MODE } = {}) => {
    const mode = normalize(rawMode);
    if (mode && VALID_MODES.has(mode)) {
        return mode;
    }

    return nodeEnv === 'development' ? 'sync' : 'none';
};

export const bootstrapDatabaseSchema = async ({
    sequelize,
    seedEnums,
    runMigrations,
    logger = console,
    nodeEnv = env.nodeEnv,
    rawMode = process.env.DB_SCHEMA_MODE,
} = {}) => {
    const mode = resolveSchemaBootstrapMode({ nodeEnv, rawMode });

    await seedEnums();

    if (mode === 'none') {
        logger.log('🧭 DB schema bootstrap mode: none (skipping sync/migrate).');
        return { mode, action: 'skip' };
    }

    if (mode === 'migrate') {
        const allowRunOnStartup = normalize(process.env.DB_RUN_MIGRATIONS_ON_STARTUP) === 'true';

        if (!allowRunOnStartup) {
            throw new Error(
                'DB_SCHEMA_MODE=migrate requires explicit migration execution. Run "npm run db:migrate" before start, or set DB_RUN_MIGRATIONS_ON_STARTUP=true for controlled startup execution.'
            );
        }

        if (typeof runMigrations !== 'function') {
            throw new Error('Migration runner is not configured.');
        }

        await runMigrations();
        logger.log('✅ Database migrations executed during startup (guarded mode).');
        return { mode, action: 'migrate' };
    }

    if (nodeEnv !== 'development') {
        logger.log(`🧭 DB schema bootstrap mode: sync requested but skipped in ${nodeEnv}.`);
        return { mode, action: 'skip-sync-non-dev' };
    }

    await sequelize.sync({ force: false, alter: false });
    logger.log('✅ Database models synchronized');
    return { mode, action: 'sync' };
};
