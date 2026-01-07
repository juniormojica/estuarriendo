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

const router = express.Router();

// User CRUD routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', authenticateToken, updateUser);  // Protected route
router.delete('/:id', deleteUser);

// User verification routes
router.put('/:id/verification-status', updateVerificationStatus);

// User plan routes
router.put('/:id/plan', updateUserPlan);

// User statistics
router.get('/:id/statistics', getUserStatistics);

export default router;
