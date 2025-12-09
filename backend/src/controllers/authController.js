import * as authService from '../services/authService.js';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 */

/**
 * Handle errors and send appropriate HTTP response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
const handleError = (res, error) => {
    console.error('Auth controller error:', error);

    // Handle custom service errors
    if (error.statusCode) {
        return res.status(error.statusCode).json({
            error: error.message
        });
    }

    // Handle unexpected errors
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const userData = req.body;

        // Validate required fields
        const { name, email, password, phone, userType } = userData;
        if (!name || !email || !password || !phone || !userType) {
            return res.status(400).json({
                error: 'Missing required fields: name, email, password, phone, userType'
            });
        }

        const result = await authService.register(userData);
        res.status(201).json(result);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
    try {
        // User ID is attached to request by auth middleware
        const userId = req.userId;

        const user = await authService.getUserById(userId);
        res.json(user);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                error: 'Email es requerido'
            });
        }

        const result = await authService.requestPasswordReset(email);
        res.json(result);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Verify reset token
 * GET /api/auth/reset-password/:token
 */
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                error: 'Token es requerido'
            });
        }

        const result = await authService.verifyResetToken(token);
        res.json(result);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validate required fields
        if (!token || !newPassword) {
            return res.status(400).json({
                error: 'Token y nueva contraseña son requeridos'
            });
        }

        // Validate password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const result = await authService.resetPassword(token, newPassword);
        res.json(result);
    } catch (error) {
        handleError(res, error);
    }
};

export default {
    register,
    login,
    getCurrentUser,
    forgotPassword,
    verifyResetToken,
    resetPassword
};
