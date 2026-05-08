import dotenv from 'dotenv';

dotenv.config();

const PLACEHOLDER_VALUES = new Set([
    'changeme',
    'change_me',
    'your_jwt_secret',
    'jwt_secret',
    'secret',
    'password',
    'example',
    'test',
    '123456',
]);

const ALLOWED_NODE_ENVS = new Set(['development', 'test', 'production']);

const throwEnvError = (variableName) => {
    throw new Error(`Invalid required environment variable: ${variableName}`);
};

const readRequired = (name) => {
    const value = process.env[name];
    if (typeof value !== 'string' || value.trim() === '') {
        throwEnvError(name);
    }
    return value.trim();
};

const validateJwtSecret = (secret) => {
    const normalized = secret.trim().toLowerCase();
    if (PLACEHOLDER_VALUES.has(normalized) || secret.trim().length < 32) {
        throwEnvError('JWT_SECRET');
    }

    return secret.trim();
};

const parsePort = (rawPort) => {
    const port = Number.parseInt(rawPort, 10);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throwEnvError('PORT');
    }
    return port;
};

const parseAllowedOrigins = (rawOrigins) => {
    const origins = rawOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (!origins.length) {
        throwEnvError('ALLOWED_ORIGINS');
    }

    return origins;
};

const nodeEnv = (process.env.NODE_ENV || 'development').trim();
if (!ALLOWED_NODE_ENVS.has(nodeEnv)) {
    throwEnvError('NODE_ENV');
}

const env = Object.freeze({
    nodeEnv,
    port: parsePort(process.env.PORT || '3001'),
    allowedOrigins: parseAllowedOrigins(
        process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://localhost:5173,http://localhost:3000'
    ),
    jwt: Object.freeze({
        secret: validateJwtSecret(readRequired('JWT_SECRET')),
        expiresIn: readRequired('JWT_EXPIRES_IN'),
    }),
    db: Object.freeze({
        host: readRequired('DB_HOST'),
        port: parsePort(process.env.DB_PORT || '5432'),
        name: readRequired('DB_NAME'),
        user: readRequired('DB_USER'),
        password: readRequired('DB_PASSWORD'),
    }),
});

export { env };
