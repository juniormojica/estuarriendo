import express from 'express';
import propertyReportController from '../controllers/propertyReportController.js';

const router = express.Router();

router.post('/', propertyReportController.createPropertyReport);
router.get('/', propertyReportController.getPropertyReports);
router.put('/:id/confirm', propertyReportController.confirmPropertyReport);
router.put('/:id/reject', propertyReportController.rejectPropertyReport);

export default router;
