import express from 'express';
import {
    getSystemConfig,
    updateSystemConfig,
    getConfigValue,
    updateConfigValue
} from '../controllers/systemConfigController.js';

const router = express.Router();

// Get full system configuration
router.get('/', getSystemConfig);

// Update system configuration (admin)
router.put('/', updateSystemConfig);

// Get specific config value
router.get('/:key', getConfigValue);

// Update specific config value (admin)
router.put('/:key', updateConfigValue);

export default router;
