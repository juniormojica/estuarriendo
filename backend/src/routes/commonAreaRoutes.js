import express from 'express';

const router = express.Router();

/**
 * Common Areas Routes
 * Public endpoint to get all available common areas
 */

// Get all common areas
router.get('/', async (req, res) => {
    try {
        const { CommonArea } = await import('../models/index.js');

        const commonAreas = await CommonArea.findAll({
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: commonAreas
        });
    } catch (error) {
        console.error('Error getting common areas:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting common areas',
            error: error.message
        });
    }
});

export default router;
