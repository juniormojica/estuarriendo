import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * JWT Utility Functions
 * Handles JWT token generation and verification
 */

const JWT_SECRET = env.jwt.secret;
const JWT_EXPIRATION = env.jwt.expiresIn;

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
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded?.userId) {
            throw new Error('Token inválido');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('El token ha expirado');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        }
        throw error;
    }
};

export default {
    generateToken,
    verifyToken
};
