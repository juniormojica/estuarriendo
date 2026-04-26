import express from 'express';
import jwt from 'jsonwebtoken';
import { sseService } from '../services/sseService.js';

const router = express.Router();

/**
 * @route GET /api/sse/admin
 * @desc SSE endpoint for admin dashboard. Requires JWT token in query param.
 */
router.get('/admin', (req, res) => {
    // EventSource doesn't support custom headers easily, so we pass the token in query string
    const token = req.query.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure user is admin or superadmin
        if (decoded.userType !== 'admin' && decoded.userType !== 'superAdmin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Setup SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Prevent proxy buffering (Nginx/Next.js)
        res.setHeader('Access-Control-Allow-Origin', '*'); // Fallback CORS
        
        // Disable compression for SSE stream if it's enabled globally
        // (Depends on compression middleware, but good practice to flush immediately)
        res.flushHeaders(); 

        // Add client to service
        sseService.addClient(decoded.userId, res);

        // Send initial connection event
        res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', adminId: decoded.userId })}\n\n`);

        // Handle connection close
        req.on('close', () => {
            sseService.removeClient(decoded.userId);
            res.end();
        });

    } catch (error) {
        console.error('[SSE Auth Error]:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});

export default router;
