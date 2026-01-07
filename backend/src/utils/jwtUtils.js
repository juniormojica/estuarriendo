import jwt from 'jsonwebtoken';

/**
 * JWT Utility Functions
 * Handles JWT token generation and verification
 */

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

/**
 * Generate JWT token for a user
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

export default {
    generateToken,
    verifyToken
};
