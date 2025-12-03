/**
 * Response Helper Utilities
 */

/**
 * Send success response
 */
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Send error response
 */
exports.errorResponse = (res, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || error
    });
};

/**
 * Convert snake_case object keys to camelCase
 */
exports.toCamelCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => exports.toCamelCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            result[camelKey] = exports.toCamelCase(obj[key]);
            return result;
        }, {});
    }

    return obj;
};

/**
 * Convert camelCase object keys to snake_case
 */
exports.toSnakeCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => exports.toSnakeCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            result[snakeKey] = exports.toSnakeCase(obj[key]);
            return result;
        }, {});
    }

    return obj;
};
