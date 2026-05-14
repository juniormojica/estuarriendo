import { User, Property, ContactUnlock, PropertyReport, CreditBalance, CreditTransaction, ReportActivityLog, ActivityLog } from '../models/index.js';
import { PropertyReportStatus, CreditTransactionType, ContactUnlockStatus, NotificationType, ReportActivityAction, UserType } from '../utils/enums.js';
import { Notification } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { AppError, badRequest, conflict, notFound } from '../errors/AppError.js';

/**
 * Tenants report a property as already rented or scam to get their credit refunded
 */
export const createPropertyReport = async (req, res, next) => {
    try {
        const reporterId = req.auth.userId;
        const { propertyId, reason, description } = req.body;

        if (!propertyId || !reason) {
            return next(badRequest('Se requiere propertyId y reason', {
                code: 'PROPERTY_REPORT_REQUIRED_FIELDS'
            }));
        }

        // Ensure user actually unlocked this property
        const unlock = await ContactUnlock.findOne({
            where: { tenantId: reporterId, propertyId, status: ContactUnlockStatus.ACTIVE }
        });

        if (!unlock) {
            return next(new AppError(
                'Debes desbloquear el contacto antes de reportar la propiedad',
                403,
                'PROPERTY_REPORT_UNLOCK_REQUIRED'
            ));
        }

        // Ensure no existing pending/investigating report
        const existingReport = await PropertyReport.findOne({
            where: {
                reporterId,
                propertyId,
                status: [PropertyReportStatus.PENDING, PropertyReportStatus.INVESTIGATING]
            }
        });

        if (existingReport) {
            return next(conflict('Ya tienes una solicitud de devolución pendiente para esta propiedad', {
                code: 'PROPERTY_REPORT_ALREADY_PENDING'
            }));
        }

        const report = await PropertyReport.create({
            reporterId,
            propertyId,
            contactUnlockId: unlock.id,
            reason,
            description,
            status: PropertyReportStatus.PENDING,
            creditRefunded: false
        });

        // Notify admins about the new report (non-blocking)
        try {
            const admins = await User.findAll({ where: { userType: UserType.SUPER_ADMIN } });
            const property = await Property.findByPk(propertyId);

            const adminNotifications = admins.map(admin => ({
                userId: admin.id,
                type: NotificationType.PROPERTY_REPORTED,
                title: 'Nuevo Reporte de Propiedad',
                message: `Un usuario ha reportado la propiedad "${property ? property.title : 'N/A'}" como "${reason}".`,
                propertyId,
                propertyTitle: property ? property.title : null,
                createdAt: new Date()
            }));

            if (adminNotifications.length > 0) {
                await Notification.bulkCreate(adminNotifications);
            }
        } catch (notifError) {
            console.error('Error sending admin notifications (report was still created):', notifError);
        }

        try {
            await ActivityLog.create({
                type: 'property_report_created',
                message: `Nuevo reporte de propiedad (${propertyId}) por usuario ${reporterId}: ${reason}`,
                userId: reporterId,
                propertyId,
                timestamp: new Date()
            });
        } catch (activityError) {
            console.error('Error creating activity log:', activityError);
        }

        res.status(201).json(report);
    } catch (error) {
        next(error);
    }
};

/**
 * Get authenticated user's own reports
 * Does NOT accept reporterId from query — always uses req.auth.userId
 */
export const getMyPropertyReports = async (req, res, next) => {
    try {
        const userId = req.auth.userId;

        const reports = await PropertyReport.findAll({
            where: { reporterId: userId },
            include: [
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title']
                },
                {
                    model: ReportActivityLog,
                    as: 'activityLogs',
                    include: [{ model: User, as: 'admin', attributes: ['id', 'name'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(reports);
    } catch (error) {
        next(error);
    }
};

/**
 * Get reports (Admin)
 */
export const getPropertyReports = async (req, res, next) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        const reports = await PropertyReport.findAll({
            where,
            include: [
                { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title', 'ownerId'],
                    include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone', 'whatsapp'] }]
                },
                {
                    model: ReportActivityLog,
                    as: 'activityLogs',
                    include: [{ model: User, as: 'admin', attributes: ['id', 'name'] }]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(reports);
    } catch (error) {
        next(error);
    }
};

/**
 * Confirm report and refund credit
 */
export const confirmPropertyReport = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { adminId, adminNotes } = req.body;

        const report = await PropertyReport.findByPk(id, {
            include: [{ model: ContactUnlock, as: 'contactUnlock' }],
            transaction: t
        });

        if (!report) {
            await t.rollback();
            return next(notFound('Reporte no encontrado', {
                code: 'PROPERTY_REPORT_NOT_FOUND'
            }));
        }

        if (report.status !== PropertyReportStatus.PENDING && report.status !== PropertyReportStatus.INVESTIGATING) {
            await t.rollback();
            return next(badRequest('El reporte ya fue procesado', {
                code: 'PROPERTY_REPORT_ALREADY_PROCESSED'
            }));
        }

        // 1. Mark report as confirmed
        report.status = PropertyReportStatus.CONFIRMED;
        report.adminNotes = adminNotes;
        report.processedBy = adminId;
        report.processedAt = new Date();

        // Log the confirmation
        await ReportActivityLog.create({
            reportId: report.id,
            adminId,
            action: ReportActivityAction.CONFIRMED,
            notes: adminNotes || 'Reporte confirmado por administración. Crédito devuelto.'
        }, { transaction: t });

        // 2. Refund credit if applicable
        if (report.contactUnlock && report.contactUnlock.status === ContactUnlockStatus.ACTIVE) {
            // Note: If they used unlimited, we don't refund a credit technically, but we can mark it as refunded.
            if (report.contactUnlock.creditTransactionId) {
                const balance = await CreditBalance.findOne({
                    where: { userId: report.reporterId },
                    transaction: t
                });

                if (balance) {
                    balance.availableCredits += 1;
                    balance.totalRefunded += 1;
                    await balance.save({ transaction: t });

                    await CreditTransaction.create({
                        userId: report.reporterId,
                        type: CreditTransactionType.REFUND,
                        amount: 1,
                        balanceAfter: balance.availableCredits,
                        description: `Devolución de crédito por reporte de propiedad (ID: ${report.propertyId})`,
                        referenceType: 'property_report',
                        referenceId: report.id
                    }, { transaction: t });
                }
            }

            report.contactUnlock.status = ContactUnlockStatus.REFUNDED;
            await report.contactUnlock.save({ transaction: t });
            report.creditRefunded = true;
        }

        await report.save({ transaction: t });

        // 3. Mark property as rented if reason is already_rented
        const property = await Property.findByPk(report.propertyId, { transaction: t });
        if (property && report.reason === 'already_rented') {
            property.isRented = true;
            await property.save({ transaction: t });

            // Notify owner
            await Notification.create({
                userId: property.ownerId,
                type: NotificationType.REPORT_RESOLVED,
                title: 'Propiedad Marcada como Arrendada',
                message: `Tras la validación de un reporte por parte de un administrador, tu propiedad "${property.title}" ha sido marcada como arrendada y retirada de listas.`,
                propertyId: property.id,
                propertyTitle: property.title,
                createdAt: new Date()
            }, { transaction: t });
        }

        // 4. Notify tenant
        await Notification.create({
            userId: report.reporterId,
            type: NotificationType.REPORT_RESOLVED,
            title: 'Reporte Confirmado',
            message: `Tu reporte sobre la propiedad "${property ? property.title : 'N/A'}" ha sido confirmado. Hemos devuelto 1 crédito a tu cuenta.`,
            propertyId: report.propertyId,
            propertyTitle: property ? property.title : null,
            createdAt: new Date()
        }, { transaction: t });

        await t.commit();
        res.json(report);
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

/**
 * Reject report
 */
export const rejectPropertyReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { adminId, adminNotes } = req.body;

        const report = await PropertyReport.findByPk(id);

        if (!report) {
            return next(notFound('Reporte no encontrado', {
                code: 'PROPERTY_REPORT_NOT_FOUND'
            }));
        }

        if (report.status !== PropertyReportStatus.PENDING && report.status !== PropertyReportStatus.INVESTIGATING) {
            return next(badRequest('El reporte ya fue procesado', {
                code: 'PROPERTY_REPORT_ALREADY_PROCESSED'
            }));
        }

        report.status = PropertyReportStatus.REJECTED;
        report.adminNotes = adminNotes;
        report.processedBy = adminId;
        report.processedAt = new Date();
        await report.save();

        // Log the rejection
        await ReportActivityLog.create({
            reportId: report.id,
            adminId,
            action: ReportActivityAction.REJECTED,
            notes: adminNotes || 'Reporte rechazado por administración.'
        });

        const property = await Property.findByPk(report.propertyId);

        // Notify tenant
        await Notification.create({
            userId: report.reporterId,
            type: NotificationType.REPORT_RESOLVED,
            title: 'Reporte Rechazado',
            message: `Tu reporte sobre la propiedad "${property ? property.title : 'N/A'}" ha sido rechazado tras revisión. El crédito no fue devuelto.`,
            propertyId: report.propertyId,
            propertyTitle: property ? property.title : null,
            createdAt: new Date()
        });

        // Notify owner
        if (property && property.ownerId) {
            await Notification.create({
                userId: property.ownerId,
                type: NotificationType.REPORT_RESOLVED,
                title: 'Reporte de Propiedad Desestimado',
                message: `Se recibió un reporte sobre tu propiedad "${property.title}", pero tras la revisión administrativa determinamos que no procedía.`,
                propertyId: property.id,
                propertyTitle: property.title,
                createdAt: new Date()
            });
        }

        res.json(report);
    } catch (error) {
        next(error);
    }
};

export default {
    createPropertyReport,
    getPropertyReports,
    getMyPropertyReports,
    confirmPropertyReport,
    rejectPropertyReport
};
