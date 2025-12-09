import { randomUUID } from 'crypto';
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/jwtUtils.js';

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

export default {
    register,
    login,
    getUserById
};
