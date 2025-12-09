import { randomUUID } from 'crypto';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/jwtUtils.js';
import {
    generateResetToken,
    hashToken,
    generateTokenExpiration,
    isTokenExpired
} from '../utils/tokenUtils.js';

/**
 * Authentication Service
 * Handles authentication business logic
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user and JWT token
 */
export const register = async (userData) => {
    const { email, password, ...otherData } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error('User with this email already exists');
        error.statusCode = 400;
        throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate unique ID for user
    const userId = randomUUID();

    // Create user
    const user = await User.create({
        id: userId,
        ...otherData,
        email,
        password: hashedPassword
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user without password
    const userJson = user.toJSON();

    return {
        user: userJson,
        token
    };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and JWT token
 */
export const login = async (email, password) => {
    // Find user with password included
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Check if user is active
    if (!user.isActive) {
        const error = new Error('Account is deactivated');
        error.statusCode = 403;
        throw error;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user without password
    const userJson = user.toJSON();
    delete userJson.password;

    return {
        user: userJson,
        token
    };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
export const getUserById = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return user;
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset token (in production, send via email)
 */
export const requestPasswordReset = async (email) => {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Don't reveal if user exists (security best practice)
    if (!user) {
        // Return success message anyway to prevent email enumeration
        return {
            message: 'Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña',
            token: null // In production, don't return token
        };
    }

    // Generate reset token
    const { rawToken, hashedToken } = generateResetToken();
    const expirationTime = generateTokenExpiration();

    // Save hashed token and expiration to database
    await user.update({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expirationTime
    });

    // In production, send rawToken via email
    // For development/testing, we return it
    return {
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña',
        token: rawToken, // Remove this in production
        email: user.email // Remove this in production
    };
};

/**
 * Verify reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Token validity and user info
 */
export const verifyResetToken = async (token) => {
    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find user with this token
    const user = await User.findOne({
        where: {
            resetPasswordToken: hashedToken
        }
    });

    if (!user) {
        const error = new Error('Token inválido o expirado');
        error.statusCode = 400;
        throw error;
    }

    // Check if token has expired
    if (isTokenExpired(user.resetPasswordExpires)) {
        const error = new Error('El token ha expirado. Por favor solicita uno nuevo');
        error.statusCode = 400;
        throw error;
    }

    // Return masked email for security
    const emailParts = user.email.split('@');
    const maskedEmail = emailParts[0].substring(0, 2) + '***@' + emailParts[1];

    return {
        valid: true,
        email: maskedEmail,
        userId: user.id
    };
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (token, newPassword) => {
    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find user with this token
    const user = await User.scope('withPassword').findOne({
        where: {
            resetPasswordToken: hashedToken
        }
    });

    if (!user) {
        const error = new Error('Token inválido o expirado');
        error.statusCode = 400;
        throw error;
    }

    // Check if token has expired
    if (isTokenExpired(user.resetPasswordExpires)) {
        const error = new Error('El token ha expirado. Por favor solicita uno nuevo');
        error.statusCode = 400;
        throw error;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token fields
    await user.update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
    });

    return {
        message: 'Contraseña actualizada exitosamente'
    };
};

export default {
    register,
    login,
    getUserById,
    requestPasswordReset,
    verifyResetToken,
    resetPassword
};
