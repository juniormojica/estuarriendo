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

export default {
    register,
    login,
    getCurrentUser
};
