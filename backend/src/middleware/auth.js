/**
 * Example Authentication Middleware
 * Placeholder for JWT authentication
 */

const authMiddleware = (req, res, next) => {
    // TODO: Implement JWT verification
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    // Verify token here
    // For now, just pass through
    next();
};

export default authMiddleware;
