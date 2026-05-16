import * as userService from '../services/userService.js';
import { AppError, badRequest, unauthorized } from '../errors/AppError.js';

/**
 * User Controller
 * Handles HTTP requests and responses for user operations
 * Delegates business logic to userService
 */

/**
 * Get all users
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

/**
 * Create new user
 * POST /api/users
 */
export const createUser = async (req, res, next) => {
    try {
        const userData = req.body;
        const user = await userService.createUser(userData);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const authUserId = req.auth?.userId;
        if (!authUserId) {
            return next(unauthorized('No autenticado', { code: 'USER_UPDATE_UNAUTHENTICATED' }));
        }

        const isOwnProfile = authUserId === id;
        if (!isOwnProfile) {
            return next(new AppError('No tienes permiso para actualizar este perfil', 403, 'USER_UPDATE_FORBIDDEN'));
        }

        const allowedFields = ['name', 'phone', 'whatsapp', 'idType', 'idNumber', 'profile'];
        const filteredUpdates = {};

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        const { name, phone } = filteredUpdates;

        if (name !== undefined && (!name || name.trim().length < 3)) {
            return next(badRequest('El nombre debe tener al menos 3 caracteres.', {
                code: 'USER_UPDATE_NAME_TOO_SHORT'
            }));
        }

        if (phone !== undefined && (!phone || phone.replace(/\D/g, '').length < 10)) {
            return next(badRequest('El teléfono debe tener al menos 10 dígitos.', {
                code: 'USER_UPDATE_PHONE_TOO_SHORT'
            }));
        }

        const { idType, idNumber } = filteredUpdates;
        const hasIdType = idType !== undefined && idType !== '' && idType !== null;
        const hasIdNumber = idNumber !== undefined && idNumber !== '' && idNumber !== null;
        if (hasIdType !== hasIdNumber) {
            return next(badRequest('Debes completar tanto el tipo como el número de documento.', {
                code: 'USER_UPDATE_DOCUMENT_PAIR_REQUIRED'
            }));
        }

        if ('name' in filteredUpdates && filteredUpdates.name === '') {
            return next(badRequest('El nombre no puede estar vacío.', {
                code: 'USER_UPDATE_NAME_EMPTY'
            }));
        }
        if ('phone' in filteredUpdates && filteredUpdates.phone === '') {
            return next(badRequest('El teléfono no puede estar vacío.', {
                code: 'USER_UPDATE_PHONE_EMPTY'
            }));
        }

        const user = await userService.updateUser(id, filteredUpdates);
        return res.json(user);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Update user verification status
 * PATCH /api/users/:id/verification
 */
export const updateVerificationStatus = async (req, res, next) => {
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
        next(error);
    }
};

/**
 * Update user plan
 * PATCH /api/users/:id/plan
 */
export const updateUserPlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const planData = req.body;

        const user = await userService.updateUserPlan(id, planData);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user statistics
 * GET /api/users/:id/statistics
 */
export const getUserStatistics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const stats = await userService.getUserStatistics(id);
        res.json(stats);
    } catch (error) {
        next(error);
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
