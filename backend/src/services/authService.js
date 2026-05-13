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
import { sendPasswordResetEmail } from './emailService.js';
import { badRequest, forbidden, notFound, unauthorized } from '../errors/AppError.js';

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
        throw badRequest('El usuario con este correo electrónico ya existe', {
            code: 'AUTH_EMAIL_ALREADY_EXISTS'
        });
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

    // Save identification details if user is an owner and has ID data
    const { idType, idNumber, role } = userData;
    if (user.userType === 'owner' && (idType || idNumber || role)) {
        const { UserIdentificationDetails } = await import('../models/index.js');
        await UserIdentificationDetails.create({
            userId: user.id,
            idType: idType || null,
            idNumber: idNumber || null,
            ownerRole: role || null,
            createdAt: new Date()
        });
    }

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
    // Find user with relationships using repository
    const { findByEmail } = await import('../repositories/userRepository.js');
    let user = await findByEmail(email);

    if (!user) {
        throw unauthorized('Correo electrónico o contraseña inválidos', {
            code: 'AUTH_INVALID_CREDENTIALS'
        });
    }

    // Since findByEmail excludes password, we need to fetch it explicitly for validation
    const userWithPassword = await User.scope('withPassword').findOne({ where: { email } });

    if (!userWithPassword) {
        throw unauthorized('Correo electrónico o contraseña inválidos', {
            code: 'AUTH_INVALID_CREDENTIALS'
        });
    }

    // Check if user is active
    if (!user.isActive) {
        throw forbidden('La cuenta está desactivada', {
            code: 'AUTH_ACCOUNT_DISABLED'
        });
    }

    // Verify password using the userWithPassword object
    const isPasswordValid = await comparePassword(password, userWithPassword.password);
    if (!isPasswordValid) {
        throw unauthorized('Correo electrónico o contraseña inválidos', {
            code: 'AUTH_INVALID_CREDENTIALS'
        });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return the user with relations (no password in this one)
    const userJson = user.toJSON();

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
    // Use userRepository to get user with all relations (including identification)
    const { findById } = await import('../repositories/userRepository.js');
    const user = await findById(userId);

    if (!user) {
        throw notFound('Usuario no encontrado', {
            code: 'AUTH_USER_NOT_FOUND'
        });
    }

    return user;
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset token (in production, send via email)
 */
export const requestPasswordReset = async (email) => {
    // Import UserPasswordReset model
    const { UserPasswordReset } = await import('../models/index.js');

    // Find user by email and extract userId
    const user = await User.findOne({ where: { email } });

    // Throw error if user doesn't exist to improve UX
    if (!user) {
        throw notFound('El correo electrónico no está registrado en la aplicación. Escribe un correo registrado o procede a registrarte.', {
            code: 'AUTH_PASSWORD_RESET_EMAIL_NOT_FOUND'
        });
    }

    // Extract userId for password reset
    const userId = user.id;

    // Generate reset token
    const { rawToken, hashedToken } = generateResetToken();
    const expirationTime = generateTokenExpiration();

    // Create or update record in user_password_reset table
    await UserPasswordReset.upsert({
        userId: userId,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expirationTime
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, rawToken);

    // Return dynamic success message with masked email
    const emailParts = user.email.split('@');
    const maskedEmail = emailParts[0].substring(0, 3) + '******@' + emailParts[1].substring(0, 2) + '****';

    return {
        message: `Se ha enviado el link de reinicio de contraseña a ${maskedEmail}`
    };
};

/**
 * Verify reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Token validity and user info
 */
export const verifyResetToken = async (token) => {
    // Import UserPasswordReset model
    const { UserPasswordReset } = await import('../models/index.js');

    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find reset token record with associated user
    const resetRecord = await UserPasswordReset.findOne({
        where: {
            resetPasswordToken: hashedToken
        },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'email']
        }]
    });

    if (!resetRecord || !resetRecord.user) {
        throw badRequest('Token inválido o expirado', {
            code: 'AUTH_RESET_TOKEN_INVALID_OR_EXPIRED'
        });
    }

    // Check if token has expired
    if (isTokenExpired(resetRecord.resetPasswordExpires)) {
        throw badRequest('El token ha expirado. Por favor solicita uno nuevo', {
            code: 'AUTH_RESET_TOKEN_EXPIRED'
        });
    }

    // Return masked email for security
    const emailParts = resetRecord.user.email.split('@');
    const maskedEmail = emailParts[0].substring(0, 2) + '***@' + emailParts[1];

    return {
        valid: true,
        email: maskedEmail,
        userId: resetRecord.user.id
    };
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
export const resetPassword = async (token, newPassword) => {
    // Import UserPasswordReset model
    const { UserPasswordReset } = await import('../models/index.js');

    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find reset token record with associated user
    const resetRecord = await UserPasswordReset.findOne({
        where: {
            resetPasswordToken: hashedToken
        },
        include: [{
            model: User,
            as: 'user',
            attributes: ['id']
        }]
    });

    if (!resetRecord || !resetRecord.user) {
        throw badRequest('Token inválido o expirado', {
            code: 'AUTH_RESET_TOKEN_INVALID_OR_EXPIRED'
        });
    }

    // Check if token has expired
    if (isTokenExpired(resetRecord.resetPasswordExpires)) {
        throw badRequest('El token ha expirado. Por favor solicita uno nuevo', {
            code: 'AUTH_RESET_TOKEN_EXPIRED'
        });
    }

    // Get the user with password scope to update it
    const user = await User.scope('withPassword').findByPk(resetRecord.user.id);

    if (!user) {
        throw notFound('Usuario no encontrado', {
            code: 'AUTH_PASSWORD_RESET_USER_NOT_FOUND'
        });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in users table
    await user.update({
        password: hashedPassword
    });

    // Delete the reset token record (one-time use)
    await resetRecord.destroy();

    return {
        message: 'Contraseña actualizada exitosamente'
    };
};

/**
 * Find user by Google ID
 * @param {string} googleId - Google OAuth user ID (sub)
 * @returns {Promise<Object|null>} User object or null
 */
export const findByGoogleId = async (googleId) => {
    const { findByGoogleId: repoFindByGoogleId } = await import('../repositories/userRepository.js');
    return repoFindByGoogleId ? repoFindByGoogleId(googleId) : User.findOne({ where: { googleId } });
};

/**
 * Create a new user authenticated via Google (no password)
 * @param {Object} googleData - { googleId, email, name, picture }
 * @param {string} userType - 'owner' | 'tenant'
 * @param {string} phone - User phone number
 * @param {string} whatsapp - User WhatsApp number
 * @returns {Promise<Object>} Created user and JWT token
 */
export const createGoogleUser = async (googleData, userType, phone, whatsapp) => {
    const { googleId, email, name, picture } = googleData;

    // Check if email already exists (registered manually)
    const existingByEmail = await User.findOne({ where: { email } });
    if (existingByEmail && !existingByEmail.googleId) {
        const error = new Error('Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.');
        error.statusCode = 409;
        throw error;
    }

    const userId = randomUUID();
    const user = await User.create({
        id: userId,
        name,
        email,
        password: null,
        googleId,
        avatarUrl: picture || null,
        phone,
        whatsapp: whatsapp || phone,
        userType,
        isActive: true,
        plan: 'premium',
        joinedAt: new Date(),
    });

    // Log activity
    const { ActivityLog } = await import('../models/index.js');
    await ActivityLog.create({
        type: 'user_registered',
        message: `Nuevo usuario registrado con Google: ${user.name} (${user.userType})`,
        userId: user.id,
        timestamp: new Date()
    });

    const token = generateToken(user.id);
    return { user: user.toJSON(), token };
};

export default {
    register,
    login,
    getUserById,
    requestPasswordReset,
    verifyResetToken,
    resetPassword,
    findByGoogleId,
    createGoogleUser,
};
