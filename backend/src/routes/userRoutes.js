import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateVerificationStatus,
    updateUserPlan,
    getUserStatistics
} from '../controllers/userController.js';
import authenticateToken from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// User routes
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.get('/:id', authenticateToken, requireAdmin, getUserById);
router.post('/', authenticateToken, requireAdmin, createUser);
router.put('/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

// User verification (admin)
router.put('/:id/verification-status', authenticateToken, requireAdmin, updateVerificationStatus);

// User plan (admin)
router.put('/:id/plan', authenticateToken, requireAdmin, updateUserPlan);

// User statistics (admin)
router.get('/:id/statistics', authenticateToken, requireAdmin, getUserStatistics);

export default router;
