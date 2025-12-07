import * as userRepository from '../repositories/userRepository.js';
import { VerificationStatus } from '../utils/enums.js';

/**
 * User Service
 * Contains business logic for user operations
 */

/**
 * Custom error classes for better error handling
 */
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

/**
 * Sanitize user object by removing sensitive data
 * @param {Object} user - User object
 * @returns {Object} Sanitized user
 */
const sanitizeUser = (user) => {
    if (!user) return null;

    const userObj = user.toJSON ? user.toJSON() : user;
    delete userObj.password;
    return userObj;
};

/**
 * Validate required user fields
 * @param {Object} userData - User data to validate
 * @throws {ValidationError} If validation fails
 */
const validateUserData = (userData) => {
    const requiredFields = ['id', 'name', 'email', 'phone', 'userType'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
        throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }
};

/**
 * Prepare new user data with defaults
 * @param {Object} userData - Raw user data
 * @returns {Object} Prepared user data
 */
const prepareNewUserData = (userData) => {
    return {
        ...userData,
        joinedAt: new Date(),
        isActive: true,
        isVerified: false,
        verificationStatus: VerificationStatus.NOT_SUBMITTED,
        propertiesCount: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        plan: 'free'
    };
};

/**
 * Get all users
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async (filters = {}) => {
    const users = await userRepository.findAll(filters);
    return users.map(sanitizeUser);
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object
 * @throws {NotFoundError} If user not found
 */
export const getUserById = async (id) => {
    const user = await userRepository.findById(id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return sanitizeUser(user);
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 * @throws {ValidationError} If validation fails
 * @throws {ConflictError} If user already exists
 */
export const createUser = async (userData) => {
    // Validate required fields
    validateUserData(userData);

    // Check if user already exists
    const existingUser = await userRepository.findById(userData.id);
    if (existingUser) {
        throw new ConflictError('User already exists');
    }

    // Prepare data with defaults
    const preparedData = prepareNewUserData(userData);

    // Create user
    const user = await userRepository.create(preparedData);

    return sanitizeUser(user);
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user
 * @throws {NotFoundError} If user not found
 */
export const updateUser = async (id, updates) => {
    // Add updated timestamp
    const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date()
    };

    const user = await userRepository.update(id, updatesWithTimestamp);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return sanitizeUser(user);
};

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise<Object>} Success message
 * @throws {NotFoundError} If user not found
 */
export const deleteUser = async (id) => {
    const deleted = await userRepository.deleteById(id);

    if (!deleted) {
        throw new NotFoundError('User not found');
    }

    return { message: 'User deleted successfully' };
};

/**
 * Update user verification status
 * @param {string} id - User ID
 * @param {string} verificationStatus - New verification status
 * @param {string} verificationRejectionReason - Rejection reason (if applicable)
 * @returns {Promise<Object>} Updated user
 * @throws {NotFoundError} If user not found
 */
export const updateVerificationStatus = async (id, verificationStatus, verificationRejectionReason = null) => {
    const updates = {
        verificationStatus,
        updatedAt: new Date()
    };

    // Set isVerified based on status
    if (verificationStatus === VerificationStatus.VERIFIED) {
        updates.isVerified = true;
    } else if (verificationStatus === VerificationStatus.REJECTED) {
        updates.verificationRejectionReason = verificationRejectionReason;
        updates.isVerified = false;
    }

    const user = await userRepository.update(id, updates);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return sanitizeUser(user);
};

/**
 * Update user plan
 * @param {string} id - User ID
 * @param {Object} planData - Plan data (plan, planType, planDuration)
 * @returns {Promise<Object>} Updated user
 * @throws {NotFoundError} If user not found
 */
export const updateUserPlan = async (id, planData) => {
    const { plan, planType, planDuration } = planData;

    // Get current user to check premium status
    const currentUser = await userRepository.findById(id);
    if (!currentUser) {
        throw new NotFoundError('User not found');
    }

    const now = new Date();
    const expiresAt = new Date(now);

    // Calculate expiration based on plan duration (in days)
    if (planDuration) {
        expiresAt.setDate(expiresAt.getDate() + planDuration);
    }

    const updates = {
        plan,
        planType,
        planStartedAt: now,
        planExpiresAt: expiresAt,
        updatedAt: now
    };

    // Set premiumSince if this is the first time going premium
    if (plan === 'premium' && !currentUser.premiumSince) {
        updates.premiumSince = now;
    }

    const user = await userRepository.update(id, updates);

    return sanitizeUser(user);
};

/**
 * Get user statistics
 * @param {string} id - User ID
 * @returns {Promise<Object>} User statistics
 * @throws {NotFoundError} If user not found
 */
export const getUserStatistics = async (id) => {
    const stats = await userRepository.getStatistics(id);

    if (!stats) {
        throw new NotFoundError('User not found');
    }

    return stats;
};

export default {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateVerificationStatus,
    updateUserPlan,
    getUserStatistics
};
