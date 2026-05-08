import { verifyToken } from '../utils/jwtUtils.js';
import checkSubscription from './checkSubscription.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches authenticated identity contract
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'Token de autorización requerido'
            });
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Formato de token inválido. Use: Bearer <token>'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Formato de token inválido. Use: Bearer <token>'
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Attach explicit auth contract + temporary compatibility field
        req.auth = { userId: decoded.userId };
        req.userId = decoded.userId;

        // Run lazy subscription expiration check
        // It's non-blocking and handles its own errors
        await checkSubscription(req, res, () => { });

        next();
    } catch (error) {
        return res.status(401).json({
            error: error.message || 'Token inválido'
        });
    }
};

export default authMiddleware;
