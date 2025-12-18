import { Notification } from '../models/index.js';
import { NotificationType } from '../utils/enums.js';

/**
 * Notification Service
 * Centralized service for creating and managing notifications
 * Designed for scalability - easy to add new notification types
 */

/**
 * Create a notification
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - Recipient user ID
 * @param {string} params.type - Notification type from NotificationType enum
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {number} [params.propertyId] - Optional property ID
 * @param {string} [params.propertyTitle] - Optional property title
 * @param {string} [params.interestedUserId] - Optional interested user ID
 * @returns {Promise<Notification>} Created notification
 */
export const createNotification = async ({
    userId,
    type,
    title,
    message,
    propertyId = null,
    propertyTitle = null,
    interestedUserId = null
}) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            propertyId,
            propertyTitle,
            interestedUserId,
            read: false,
            createdAt: new Date()
        });

        console.log(`✅ Notification created: ${type} for user ${userId}`);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Notify user that their payment has been verified
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.userName - User name
 * @param {string} params.planType - Plan type (e.g., "Premium Mensual")
 * @param {Date} params.expiresAt - Plan expiration date
 */
export const notifyPaymentVerified = async ({ userId, userName, planType, expiresAt }) => {
    const expirationDate = new Date(expiresAt).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return await createNotification({
        userId,
        type: NotificationType.PAYMENT_VERIFIED,
        title: '✅ ¡Pago Verificado!',
        message: `Tu pago ha sido aprobado. Ahora tienes acceso al plan ${planType} hasta el ${expirationDate}. ¡Disfruta de todos los beneficios Premium!`
    });
};

/**
 * Notify user that their payment has been rejected
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.userName - User name
 * @param {string} [params.reason] - Rejection reason
 */
export const notifyPaymentRejected = async ({ userId, userName, reason }) => {
    const message = reason
        ? `Tu solicitud de pago ha sido rechazada. Motivo: ${reason}. Por favor, verifica tu comprobante y vuelve a intentarlo.`
        : 'Tu solicitud de pago ha sido rechazada. Por favor, verifica tu comprobante y vuelve a intentarlo.';

    return await createNotification({
        userId,
        type: NotificationType.PAYMENT_REJECTED,
        title: '❌ Pago Rechazado',
        message
    });
};

/**
 * Notify admin that a user has submitted a payment proof
 * @param {Object} params
 * @param {string} params.adminId - Admin user ID (or 'all-admins' for broadcast)
 * @param {string} params.userName - User name who submitted payment
 * @param {string} params.planType - Plan type requested
 * @param {number} params.amount - Payment amount
 * @param {string} params.referenceCode - Payment reference code
 */
export const notifyPaymentSubmitted = async ({ adminId, userName, planType, amount, referenceCode }) => {
    return await createNotification({
        userId: adminId,
        type: NotificationType.PAYMENT_SUBMITTED,
        title: '💰 Nuevo Comprobante de Pago',
        message: `${userName} ha subido un comprobante de pago para el plan ${planType} por $${amount.toLocaleString()}. Referencia: ${referenceCode}`
    });
};

/**
 * Notify property owner that their property has been approved
 * @param {Object} params
 * @param {string} params.userId - Owner user ID
 * @param {number} params.propertyId - Property ID
 * @param {string} params.propertyTitle - Property title
 */
export const notifyPropertyApproved = async ({ userId, propertyId, propertyTitle }) => {
    return await createNotification({
        userId,
        type: NotificationType.PROPERTY_APPROVED,
        title: '✅ Propiedad Aprobada',
        message: `Tu propiedad "${propertyTitle}" ha sido aprobada y ahora está visible para los estudiantes.`,
        propertyId,
        propertyTitle
    });
};

/**
 * Notify property owner that their property has been rejected
 * @param {Object} params
 * @param {string} params.userId - Owner user ID
 * @param {number} params.propertyId - Property ID
 * @param {string} params.propertyTitle - Property title
 * @param {string} params.reason - Rejection reason
 */
export const notifyPropertyRejected = async ({ userId, propertyId, propertyTitle, reason }) => {
    return await createNotification({
        userId,
        type: NotificationType.PROPERTY_REJECTED,
        title: '❌ Propiedad Rechazada',
        message: `Tu propiedad "${propertyTitle}" ha sido rechazada. Motivo: ${reason}`,
        propertyId,
        propertyTitle
    });
};

/**
 * Notify property owner of new tenant interest
 * @param {Object} params
 * @param {string} params.userId - Owner user ID
 * @param {number} params.propertyId - Property ID
 * @param {string} params.propertyTitle - Property title
 * @param {string} params.interestedUserId - Interested tenant ID
 * @param {string} params.interestedUserName - Interested tenant name
 */
export const notifyPropertyInterest = async ({
    userId,
    propertyId,
    propertyTitle,
    interestedUserId,
    interestedUserName
}) => {
    return await createNotification({
        userId,
        type: NotificationType.PROPERTY_INTEREST,
        title: '🔔 Nuevo Interesado',
        message: `${interestedUserName} está interesado en tu propiedad "${propertyTitle}".`,
        propertyId,
        propertyTitle,
        interestedUserId
    });
};

export default {
    createNotification,
    notifyPaymentVerified,
    notifyPaymentRejected,
    notifyPaymentSubmitted,
    notifyPropertyApproved,
    notifyPropertyRejected,
    notifyPropertyInterest
};

