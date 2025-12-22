import * as userService from '../services/userService.js';

/**
 * User Controller
 * Handles HTTP requests and responses for user operations
 * Delegates business logic to userService
 */

/**
 * Handle errors and send appropriate HTTP response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
const handleError = (res, error) => {
    console.error('Controller error:', error);

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
 * Get all users
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.json(user);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Create new user
 * POST /api/users
 */
export const createUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await userService.createUser(userData);
        res.status(201).json(user);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Security: Only allow users to update their own profile (unless admin/superAdmin)
        if (req.user) {
            const isOwnProfile = req.user.id === id;
            const isAdmin = req.user.userType === 'admin' || req.user.userType === 'superAdmin';

            if (!isOwnProfile && !isAdmin) {
                return res.status(403).json({
                    error: 'No tienes permiso para actualizar este perfil'
                });
            }

            // For regular users updating their own profile, only allow specific fields
            if (isOwnProfile && !isAdmin) {
                const allowedFields = ['name', 'phone', 'whatsapp', 'idType', 'idNumber'];
                const filteredUpdates = {};

                allowedFields.forEach(field => {
                    if (updates[field] !== undefined) {
                        filteredUpdates[field] = updates[field];
                    }
                });

                // Use filtered updates instead of all updates
                const user = await userService.updateUser(id, filteredUpdates);
                return res.json(user);
            }
        }

        // Admin can update any field
        const user = await userService.updateUser(id, updates);
        res.json(user);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        res.json(result);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Update user verification status
 * PATCH /api/users/:id/verification
 */
export const updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { verificationStatus, verificationRejectionReason } = req.body;

        console.log('🔄 updateVerificationStatus called with:');
        console.log('  - User ID:', id);
        console.log('  - Status:', verificationStatus);
        console.log('  - Reason:', verificationRejectionReason);

        const user = await userService.updateVerificationStatus(
            id,
            verificationStatus,
            verificationRejectionReason
        );

        console.log('✅ User verification status updated successfully');
        res.json(user);
    } catch (error) {
        console.error('❌ Error in updateVerificationStatus:', error.message);
        handleError(res, error);
    }
};

/**
 * Update user plan
 * PATCH /api/users/:id/plan
 */
export const updateUserPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const planData = req.body;

        const user = await userService.updateUserPlan(id, planData);
        res.json(user);
    } catch (error) {
        handleError(res, error);
    }
};

/**
 * Get user statistics
 * GET /api/users/:id/statistics
 */
export const getUserStatistics = async (req, res) => {
    try {
        const { id } = req.params;
        const stats = await userService.getUserStatistics(id);
        res.json(stats);
    } catch (error) {
        handleError(res, error);
    }
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
