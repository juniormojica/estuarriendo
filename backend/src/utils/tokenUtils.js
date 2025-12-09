import crypto from 'crypto';

/**
 * Token Utility Functions
 * Handles password reset token generation and validation
 */

/**
 * Generate a secure random token for password reset
 * @returns {Object} Object containing raw token and hashed token
 */
export const generateResetToken = () => {
    // Generate a random token (32 bytes = 64 hex characters)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash the token for storage in database
    const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    return {
        rawToken,      // Send this to user
        hashedToken    // Store this in database
    };
};

/**
 * Hash a token for comparison with stored hash
 * @param {string} token - Raw token to hash
 * @returns {string} Hashed token
 */
export const hashToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

/**
 * Generate token expiration time (1 hour from now)
 * @returns {Date} Expiration date
 */
export const generateTokenExpiration = () => {
    return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
};

/**
 * Check if a token has expired
 * @param {Date} expirationDate - Token expiration date
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (expirationDate) => {
    return new Date() > new Date(expirationDate);
};

export default {
    generateResetToken,
    hashToken,
    generateTokenExpiration,
    isTokenExpired
};
