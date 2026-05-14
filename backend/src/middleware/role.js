import User from '../models/User.js';
import { UserType } from '../utils/enums.js';
import { forbidden, unauthorized } from '../errors/AppError.js';

const requireRole = (...allowedTypes) => {
    return async (req, res, next) => {
        try {
            const userId = req.auth?.userId;
            if (!userId) {
                const err = unauthorized('Autenticación requerida');
                return res.status(err.statusCode).json({ error: err.message });
            }

            const user = await User.findByPk(userId, {
                attributes: ['userType']
            });

            if (!user) {
                const err = unauthorized('Usuario no encontrado');
                return res.status(err.statusCode).json({ error: err.message });
            }

            if (!allowedTypes.includes(user.userType)) {
                const err = forbidden('Acceso denegado. Se requieren permisos de administrador');
                return res.status(err.statusCode).json({ error: err.message });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    };
};

export const requireAdmin = requireRole(UserType.ADMIN, UserType.SUPER_ADMIN);

export const requireSuperAdmin = requireRole(UserType.SUPER_ADMIN);

export default { requireAdmin, requireSuperAdmin };
