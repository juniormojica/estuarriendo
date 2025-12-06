/**
 * Validation Utilities
 * Common validation functions for data integrity
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate Colombian phone number (10 digits)
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^3\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate Colombian ID number (Cédula)
 */
export const isValidCC = (idNumber) => {
    return /^\d{6,10}$/.test(idNumber);
};

/**
 * Validate NIT (Colombian business ID)
 */
export const isValidNIT = (idNumber) => {
    return /^\d{9,10}$/.test(idNumber);
};

/**
 * Validate price range
 */
export const isValidPrice = (price, min = 0, max = Infinity) => {
    return typeof price === 'number' && price >= min && price <= max;
};

/**
 * Validate date is in the future
 */
export const isFutureDate = (date) => {
    return new Date(date) > new Date();
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (coordinates) => {
    if (!coordinates || typeof coordinates !== 'object') return false;
    const { lat, lng } = coordinates;
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate array of strings
 */
export const isValidStringArray = (arr) => {
    return Array.isArray(arr) && arr.every(item => typeof item === 'string');
};
