import { AppError } from '../errors/AppError.js';

const INTERNAL_ERROR_MESSAGE = 'Error interno del servidor';

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const isAppError = error instanceof AppError;
    const legacyStatusCandidate = error?.statusCode ?? error?.status;
    const legacyStatusCode = Number.parseInt(legacyStatusCandidate, 10);
    const isLegacyOperational = !isAppError && Number.isInteger(legacyStatusCode) && legacyStatusCode >= 400 && legacyStatusCode < 500;

    const statusCode = isAppError
        ? error.statusCode
        : isLegacyOperational
            ? legacyStatusCode
            : 500;

    const message = isAppError || isLegacyOperational
        ? error.message
        : INTERNAL_ERROR_MESSAGE;

    const code = isAppError
        ? error.code
        : isLegacyOperational
            ? error.code || 'OPERATIONAL_ERROR'
            : 'INTERNAL_SERVER_ERROR';

    const response = {
        error: message,
        message,
        code
    };

    if (isAppError && error.details !== undefined) {
        response.details = error.details;
    }

    if (!isAppError && !isLegacyOperational) {
        console.error('Unexpected error:', error);
    }

    return res.status(statusCode).json(response);
};

export default errorHandler;
