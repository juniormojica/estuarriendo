import express from 'express';
import propertyReportController from '../controllers/propertyReportController.js';
import reportActivityLogController from '../controllers/reportActivityLogController.js';

const router = express.Router();

router.post('/', propertyReportController.createPropertyReport);
router.get('/', propertyReportController.getPropertyReports);
router.put('/:id/confirm', propertyReportController.confirmPropertyReport);
router.put('/:id/reject', propertyReportController.rejectPropertyReport);

// Activity logs
router.post('/:id/activity', reportActivityLogController.addReportActivity);
router.get('/:id/activity', reportActivityLogController.getReportActivity);

export default router;
