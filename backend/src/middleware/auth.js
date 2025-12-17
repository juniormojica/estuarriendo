import { verifyToken } from '../utils/jwtUtils.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user ID to request
 */
const authMiddleware = (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No token provided. Authorization header must be in format: Bearer <token>'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        // Attach userId to request (controller expects req.userId)
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            error: error.message || 'Invalid or expired token'
        });
    }
};

export default authMiddleware;
