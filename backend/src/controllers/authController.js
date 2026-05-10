import * as authService from '../services/authService.js';
import { verifyGoogleToken } from '../services/googleAuthService.js';
import { badRequest, conflict } from '../errors/AppError.js';
import { ActivityLog } from '../models/index.js';
import User from '../models/User.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 */

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const userData = req.body;

        // Validate required fields
        const { name, email, password, phone, userType } = userData;
        if (!name || !email || !password || !phone || !userType) {
            throw badRequest('Faltan campos obligatorios: name, email, password, phone, userType', {
                code: 'AUTH_REGISTER_REQUIRED_FIELDS'
            });
        }

        const result = await authService.register(userData);

        // Log activity
        await ActivityLog.create({
            type: 'user_registered',
            message: `Nuevo usuario registrado: ${result.user.name} (${result.user.userType})`,
            userId: result.user.id,
            timestamp: new Date()
        });

        // Set HTTP-only cookie for Next.js middleware
        res.cookie('estuarriendo_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/'
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            throw badRequest('Correo electrónico o contraseña son requeridos', {
                code: 'AUTH_LOGIN_REQUIRED_FIELDS'
            });
        }

        const result = await authService.login(email, password);

        // Set HTTP-only cookie for Next.js middleware
        res.cookie('estuarriendo_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/'
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
    try {
        res.clearCookie('estuarriendo_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        // User ID is attached to request by auth middleware
        const userId = req.userId;

        const user = await authService.getUserById(userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            throw badRequest('Email es requerido', {
                code: 'AUTH_FORGOT_PASSWORD_EMAIL_REQUIRED'
            });
        }

        const result = await authService.requestPasswordReset(email);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Verify reset token
 * GET /api/auth/reset-password/:token
 */
export const verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            throw badRequest('Token es requerido', {
                code: 'AUTH_RESET_TOKEN_REQUIRED'
            });
        }

        const result = await authService.verifyResetToken(token);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        // Validate required fields
        if (!token || !newPassword) {
            throw badRequest('Token y nueva contraseña son requeridos', {
                code: 'AUTH_RESET_PASSWORD_REQUIRED_FIELDS'
            });
        }

        // Validate password length
        if (newPassword.length < 6) {
            throw badRequest('La contraseña debe tener al menos 6 caracteres', {
                code: 'AUTH_RESET_PASSWORD_TOO_SHORT'
            });
        }

        const result = await authService.resetPassword(token, newPassword);
        res.json(result);
    } catch (error) {
        next(error);
    }
};


/**
 * Google OAuth — Step 1: Verify token and check if user exists
 * POST /api/auth/google
 *
 * Returns:
 *   - { user, token }                            → existing Google user (direct login)
 *   - Error 409                                  → email already registered manually
 *   - { needsRegistration: true, googleData }    → new user, open modal
 */
export const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            throw badRequest('Token de Google es requerido', {
                code: 'AUTH_GOOGLE_TOKEN_REQUIRED'
            });
        }

        // 1. Verify Google token
        const googleData = await verifyGoogleToken(credential);

        // 2. Check if user already exists by googleId
        const existingByGoogleId = await User.findOne({ where: { googleId: googleData.googleId } });
        if (existingByGoogleId) {
            // Direct login — generate JWT and return
            const token = (await import('../utils/jwtUtils.js')).generateToken(existingByGoogleId.id);

            // Set HTTP-only cookie
            res.cookie('estuarriendo_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                path: '/'
            });

            return res.json({ user: existingByGoogleId.toJSON(), token });
        }

        // 3. Check if email is already registered manually (no googleId)
        const existingByEmail = await User.findOne({ where: { email: googleData.email } });
        if (existingByEmail && !existingByEmail.googleId) {
            throw conflict('Ya tienes una cuenta registrada con este correo. Por favor inicia sesión con tu contraseña.', {
                code: 'AUTH_GOOGLE_EMAIL_CONFLICT'
            });
        }

        // 4. New user — send back googleData so frontend shows the registration modal
        return res.status(200).json({
            needsRegistration: true,
            googleData: {
                googleId: googleData.googleId,
                email: googleData.email,
                name: googleData.name,
                picture: googleData.picture,
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Google OAuth — Step 2: Complete registration for new Google users
 * POST /api/auth/google/complete-registration
 */
export const googleCompleteRegistration = async (req, res, next) => {
    try {
        const { googleId, email, name, picture, userType, phone, whatsapp } = req.body;

        if (!googleId || !email || !userType || !phone) {
            throw badRequest('Faltan campos obligatorios: googleId, email, userType, phone', {
                code: 'AUTH_GOOGLE_COMPLETE_REQUIRED_FIELDS'
            });
        }

        const result = await authService.createGoogleUser(
            { googleId, email, name, picture },
            userType,
            phone,
            whatsapp
        );

        // Set HTTP-only cookie
        res.cookie('estuarriendo_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/'
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    googleAuth,
    googleCompleteRegistration,
};
