import User from '../models/User.js';
import { unauthorized, forbidden } from '../errors/AppError.js';
import { UserType } from './enums.js';

const ADMIN_USER_TYPES = [UserType.ADMIN, UserType.SUPER_ADMIN];

export const ensureOwnUserOrAdmin = async (req, targetUserId, options = {}) => {
    const {
        authRequiredCode = 'AUTH_REQUIRED',
        authUserNotFoundCode = 'AUTH_USER_NOT_FOUND',
        forbiddenCode = 'FORBIDDEN',
        forbiddenMessage = 'No tienes permiso para acceder a este recurso'
    } = options;

    const authUserId = req.auth?.userId;
    if (!authUserId) {
        throw unauthorized('Autenticación requerida', { code: authRequiredCode });
    }

    if (String(authUserId) === String(targetUserId)) {
        return;
    }

    const authUser = await User.findByPk(authUserId, {
        attributes: ['userType']
    });

    if (!authUser) {
        throw unauthorized('Usuario autenticado no encontrado', { code: authUserNotFoundCode });
    }

    if (!ADMIN_USER_TYPES.includes(authUser.userType)) {
        throw forbidden(forbiddenMessage, { code: forbiddenCode });
    }
};

export default {
    ensureOwnUserOrAdmin
};
