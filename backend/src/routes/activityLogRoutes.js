import express from 'express';
import {
    getAllActivityLogs,
    getActivityLogById,
    createActivityLog,
    getActivityStatistics,
    deleteOldLogs
} from '../controllers/activityLogController.js';
import authenticateToken from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// Activity logs (admin only)
router.get('/', authenticateToken, requireAdmin, getAllActivityLogs);
router.get('/:id', authenticateToken, requireAdmin, getActivityLogById);
router.post('/', authenticateToken, requireAdmin, createActivityLog);
router.get('/statistics/summary', authenticateToken, requireAdmin, getActivityStatistics);
router.delete('/cleanup', authenticateToken, requireAdmin, deleteOldLogs);

export default router;
