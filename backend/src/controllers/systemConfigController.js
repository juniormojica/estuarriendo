import { SystemConfig } from '../models/index.js';

/**
 * SystemConfig Controller
 * Handles global system configuration (single row table)
 */

// Get system configuration
export const getSystemConfig = async (req, res) => {
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
        console.error('Error fetching system config:', error);
        res.status(500).json({ error: 'Failed to fetch system config', message: error.message });
    }
};

// Update system configuration (admin only)
export const updateSystemConfig = async (req, res) => {
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
        console.error('Error updating system config:', error);
        res.status(500).json({ error: 'Failed to update system config', message: error.message });
    }
};

// Get specific config value
export const getConfigValue = async (req, res) => {
    try {
        const { key } = req.params;

        const config = await SystemConfig.findOne({
            where: { id: true }
        });

        if (!config) {
            return res.status(404).json({ error: 'System config not found' });
        }

        if (!(key in config.dataValues)) {
            return res.status(404).json({ error: 'Config key not found' });
        }

        res.json({
            key,
            value: config[key]
        });
    } catch (error) {
        console.error('Error fetching config value:', error);
        res.status(500).json({ error: 'Failed to fetch config value', message: error.message });
    }
};

// Update specific config value (admin only)
export const updateConfigValue = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (value === undefined) {
            return res.status(400).json({ error: 'Value is required' });
        }

        let config = await SystemConfig.findOne({
            where: { id: true }
        });

        if (!config) {
            return res.status(404).json({ error: 'System config not found' });
        }

        if (!(key in config.dataValues)) {
            return res.status(404).json({ error: 'Config key not found' });
        }

        await config.update({ [key]: value });

        res.json({
            message: 'Config value updated successfully',
            key,
            value: config[key]
        });
    } catch (error) {
        console.error('Error updating config value:', error);
        res.status(500).json({ error: 'Failed to update config value', message: error.message });
    }
};

export default {
    getSystemConfig,
    updateSystemConfig,
    getConfigValue,
    updateConfigValue
};
