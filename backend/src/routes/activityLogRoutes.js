import express from 'express';
import {
    getAllActivityLogs,
    getActivityLogById,
    createActivityLog,
    getActivityStatistics,
    deleteOldLogs
} from '../controllers/activityLogController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Get all activity logs with filters
router.get('/', authenticateToken, getAllActivityLogs);

// Get activity log by ID
router.get('/:id', authenticateToken, getActivityLogById);

// Create activity log
router.post('/', authenticateToken, createActivityLog);

// Get activity statistics
router.get('/statistics/summary', authenticateToken, getActivityStatistics);

// Delete old logs (cleanup)
router.delete('/cleanup', authenticateToken, deleteOldLogs);

export default router;
