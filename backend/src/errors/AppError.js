export class AppError extends Error {
    constructor(message, statusCode, code, options = {}) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        if (options.details !== undefined) {
            this.details = options.details;
        }

        if (options.cause !== undefined) {
            this.cause = options.cause;
        }
    }
}

const resolveCodeAndOptions = (defaultCode, options = {}) => {
    const { code, ...rest } = options;
    return { code: code || defaultCode, options: rest };
};

export const badRequest = (message = 'Bad request', options = {}) => {
    const resolved = resolveCodeAndOptions('BAD_REQUEST', options);
    return new AppError(message, 400, resolved.code, resolved.options);
};

export const unauthorized = (message = 'Unauthorized', options = {}) => {
    const resolved = resolveCodeAndOptions('UNAUTHORIZED', options);
    return new AppError(message, 401, resolved.code, resolved.options);
};

export const notFound = (message = 'Resource not found', options = {}) => {
    const resolved = resolveCodeAndOptions('NOT_FOUND', options);
    return new AppError(message, 404, resolved.code, resolved.options);
};

export const conflict = (message = 'Conflict', options = {}) => {
    const resolved = resolveCodeAndOptions('CONFLICT', options);
    return new AppError(message, 409, resolved.code, resolved.options);
};

export default AppError;
