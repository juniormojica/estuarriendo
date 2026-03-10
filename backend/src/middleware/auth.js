import { verifyToken } from '../utils/jwtUtils.js';
import checkSubscription from './checkSubscription.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user ID to request
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'No se proporcionó token. El encabezado de autorización debe tener el formato: Bearer <token>'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        // Attach userId to request (controller expects req.userId)
        req.userId = decoded.userId;

        // Run lazy subscription expiration check
        // It's non-blocking and handles its own errors
        await checkSubscription(req, res, () => { });

        next();
    } catch (error) {
        return res.status(401).json({
            error: error.message || 'Token inválido o expirado'
        });
    }
};

export default authMiddleware;
