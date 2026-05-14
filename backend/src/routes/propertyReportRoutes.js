import express from 'express';
import propertyReportController from '../controllers/propertyReportController.js';
import reportActivityLogController from '../controllers/reportActivityLogController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// User-facing: create and list reports
router.post('/', propertyReportController.createPropertyReport);
router.get('/', propertyReportController.getPropertyReports);

// Admin: confirm/reject reports
router.put('/:id/confirm', authMiddleware, requireAdmin, propertyReportController.confirmPropertyReport);
router.put('/:id/reject', authMiddleware, requireAdmin, propertyReportController.rejectPropertyReport);

// Activity logs
router.post('/:id/activity', reportActivityLogController.addReportActivity);
router.get('/:id/activity', reportActivityLogController.getReportActivity);

export default router;
