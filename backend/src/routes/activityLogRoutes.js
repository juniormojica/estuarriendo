import express from 'express';
import {
    getAllActivityLogs,
    getActivityLogById,
    createActivityLog,
    getActivityStatistics,
    deleteOldLogs
} from '../controllers/activityLogController.js';

const router = express.Router();

// Get all activity logs with filters
router.get('/', getAllActivityLogs);

// Get activity log by ID
router.get('/:id', getActivityLogById);

// Create activity log
router.post('/', createActivityLog);

// Get activity statistics
router.get('/statistics/summary', getActivityStatistics);

// Delete old logs (cleanup)
router.delete('/cleanup', deleteOldLogs);

export default router;
