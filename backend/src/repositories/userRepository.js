import { User, UserVerificationDocuments } from '../models/index.js';

/**
 * User Repository
 * Handles all database operations for users
 */

/**
 * Find all users with optional filters and includes
 * @param {Object} options - Query options (where, include, attributes, etc.)
 * @returns {Promise<Array>} Array of users
 */
export const findAll = async (options = {}) => {
    const defaultOptions = {
        attributes: { exclude: ['password'] },
        include: [
            {
                model: UserVerificationDocuments,
                as: 'verificationDocuments',
                attributes: ['submittedAt', 'processedAt']
            }
        ]
    };

    return await User.findAll({ ...defaultOptions, ...options });
};

/**
 * Find user by ID
 * @param {string} id - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object|null>} User object or null
 */
export const findById = async (id, options = {}) => {
    const defaultOptions = {
        attributes: { exclude: ['password'] },
        include: [
            {
                model: UserVerificationDocuments,
                as: 'verificationDocuments',
                attributes: ['submittedAt', 'processedAt']
            }
        ]
    };

    return await User.findByPk(id, { ...defaultOptions, ...options });
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
export const findByEmail = async (email) => {
    return await User.findOne({
        where: { email },
        attributes: { exclude: ['password'] }
    });
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export const create = async (userData) => {
    return await User.create(userData);
};

/**
 * Update user by ID
 * @param {string} id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user or null
 */
export const update = async (id, updates) => {
    const user = await User.findByPk(id);
    if (!user) {
        return null;
    }

    return await user.update(updates);
};

/**
 * Delete user by ID
 * @param {string} id - User ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteById = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        return false;
    }

    await user.destroy();
    return true;
};

/**
 * Get user statistics (minimal data)
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User statistics or null
 */
export const getStatistics = async (id) => {
    return await User.findByPk(id, {
        attributes: [
            'id',
            'name',
            'propertiesCount',
            'approvedCount',
            'pendingCount',
            'rejectedCount',
            'plan',
            'planExpiresAt'
        ]
    });
};

export default {
    findAll,
    findById,
    findByEmail,
    create,
    update,
    deleteById,
    getStatistics
};
