import express from 'express';
import propertyReportController from '../controllers/propertyReportController.js';
import reportActivityLogController from '../controllers/reportActivityLogController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// User-facing: create report (authenticated)
router.post('/', authMiddleware, propertyReportController.createPropertyReport);

// Admin: list all reports
router.get('/', authMiddleware, requireAdmin, propertyReportController.getPropertyReports);

// User-facing: list own reports (authenticated, no client-supplied reporterId)
router.get('/my', authMiddleware, propertyReportController.getMyPropertyReports);

router.put('/:id/confirm', authMiddleware, requireAdmin, propertyReportController.confirmPropertyReport);
router.put('/:id/reject', authMiddleware, requireAdmin, propertyReportController.rejectPropertyReport);

// Activity logs (admin only — changes report status)
router.post('/:id/activity', authMiddleware, requireAdmin, reportActivityLogController.addReportActivity);
router.get('/:id/activity', authMiddleware, requireAdmin, reportActivityLogController.getReportActivity);

export default router;
