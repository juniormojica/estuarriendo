/**
 * Response Helper Utilities
 */

/**
 * Send success response
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Send error response
 */
export const errorResponse = (res, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || error
    });
};

/**
 * Convert snake_case object keys to camelCase
 */
export const toCamelCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => toCamelCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            result[camelKey] = toCamelCase(obj[key]);
            return result;
        }, {});
    }

    return obj;
};

/**
 * Convert camelCase object keys to snake_case
 */
export const toSnakeCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => toSnakeCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            result[snakeKey] = toSnakeCase(obj[key]);
            return result;
        }, {});
    }

    return obj;
};
