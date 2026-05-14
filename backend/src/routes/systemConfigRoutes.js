import express from 'express';
import {
    getSystemConfig,
    updateSystemConfig,
    getConfigValue,
    updateConfigValue
} from '../controllers/systemConfigController.js';
import authMiddleware from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';

const router = express.Router();

// System configuration (admin only)
router.get('/', authMiddleware, requireAdmin, getSystemConfig);
router.put('/', authMiddleware, requireAdmin, updateSystemConfig);
router.get('/:key', authMiddleware, requireAdmin, getConfigValue);
router.put('/:key', authMiddleware, requireAdmin, updateConfigValue);

export default router;
