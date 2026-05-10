import { SystemConfig } from '../models/index.js';
import { badRequest, notFound } from '../errors/AppError.js';

/**
 * SystemConfig Controller
 * Handles global system configuration (single row table)
 */

// Get system configuration
export const getSystemConfig = async (req, res, next) => {
    try {
        let config = await SystemConfig.findOne({
            where: { id: true }
        });

        // If no config exists, create default
        if (!config) {
            config = await SystemConfig.create({
                id: true,
                commissionRate: 0.05,
                featuredPropertyPrice: 50000.00,
                maxImagesPerProperty: 10,
                minPropertyPrice: 50000.00,
                maxPropertyPrice: 5000000.00,
                autoApprovalEnabled: false
            });
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
};

// Update system configuration (admin only)
export const updateSystemConfig = async (req, res, next) => {
    try {
        const updates = req.body;

        let config = await SystemConfig.findOne({
            where: { id: true }
        });

        if (!config) {
            // Create if doesn't exist
            config = await SystemConfig.create({
                id: true,
                ...updates
            });
        } else {
            // Update existing
            await config.update(updates);
        }

        res.json(config);
    } catch (error) {
        next(error);
    }
};

// Get specific config value
export const getConfigValue = async (req, res, next) => {
    try {
        const { key } = req.params;

        const config = await SystemConfig.findOne({
            where: { id: true }
        });

        if (!config) {
            throw notFound('System config not found', { code: 'SYSTEM_CONFIG_NOT_FOUND' });
        }

        if (!(key in config.dataValues)) {
            throw notFound('Config key not found', { code: 'SYSTEM_CONFIG_KEY_NOT_FOUND' });
        }

        res.json({
            key,
            value: config[key]
        });
    } catch (error) {
        next(error);
    }
};

// Update specific config value (admin only)
export const updateConfigValue = async (req, res, next) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (value === undefined) {
            throw badRequest('Value is required', { code: 'SYSTEM_CONFIG_VALUE_REQUIRED' });
        }

        let config = await SystemConfig.findOne({
            where: { id: true }
        });

        if (!config) {
            throw notFound('System config not found', { code: 'SYSTEM_CONFIG_NOT_FOUND' });
        }

        if (!(key in config.dataValues)) {
            throw notFound('Config key not found', { code: 'SYSTEM_CONFIG_KEY_NOT_FOUND' });
        }

        await config.update({ [key]: value });

        res.json({
            message: 'Config value updated successfully',
            key,
            value: config[key]
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getSystemConfig,
    updateSystemConfig,
    getConfigValue,
    updateConfigValue
};
