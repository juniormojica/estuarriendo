import { User, Property, ContactUnlock, PropertyReport, CreditBalance, CreditTransaction, ReportActivityLog } from '../models/index.js';
import { PropertyReportStatus, CreditTransactionType, ContactUnlockStatus, NotificationType, ReportActivityAction } from '../utils/enums.js';
import { Notification } from '../models/index.js';
import { sequelize } from '../config/database.js';

/**
 * Tenants report a property as already rented or scam to get their credit refunded
 */
export const createPropertyReport = async (req, res) => {
    try {
        const { reporterId, propertyId, reason, description } = req.body;

        if (!reporterId || !propertyId || !reason) {
            return res.status(400).json({ error: 'Se requiere reporterId, propertyId y reason' });
        }

        // Ensure user actually unlocked this property
        const unlock = await ContactUnlock.findOne({
            where: { tenantId: reporterId, propertyId, status: ContactUnlockStatus.ACTIVE }
        });

        if (!unlock) {
            return res.status(403).json({ error: 'Debes desbloquear el contacto antes de reportar la propiedad' });
        }

        // Ensure no existing pending report
        const existingReport = await PropertyReport.findOne({
            where: { reporterId, propertyId, status: PropertyReportStatus.PENDING }
        });

        if (existingReport) {
            return res.status(400).json({ error: 'Ya tienes una solicitud de devolución pendiente para esta propiedad' });
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

        // Notify admins about the new report
        const admins = await User.findAll({ where: { role: 'superAdmin' } });
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

        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating property report:', error);
        res.status(500).json({ error: 'Error al crear el reporte', message: error.message });
    }
};

/**
 * Get reports (Admin)
 */
export const getPropertyReports = async (req, res) => {
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
        console.error('Error fetching property reports:', error);
        res.status(500).json({ error: 'Error al obtener los reportes', message: error.message });
    }
};

/**
 * Confirm report and refund credit
 */
export const confirmPropertyReport = async (req, res) => {
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
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        if (report.status !== PropertyReportStatus.PENDING && report.status !== PropertyReportStatus.INVESTIGATING) {
            await t.rollback();
            return res.status(400).json({ error: 'El reporte ya fue procesado' });
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
        console.error('Error confirming report:', error);
        res.status(500).json({ error: 'Error al confirmar el reporte', message: error.message });
    }
};

/**
 * Reject report
 */
export const rejectPropertyReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, adminNotes } = req.body;

        const report = await PropertyReport.findByPk(id);

        if (!report) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
        }

        if (report.status !== PropertyReportStatus.PENDING && report.status !== PropertyReportStatus.INVESTIGATING) {
            return res.status(400).json({ error: 'El reporte ya fue procesado' });
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
        console.error('Error rejecting report:', error);
        res.status(500).json({ error: 'Error al rechazar el reporte', message: error.message });
    }
};

export default {
    createPropertyReport,
    getPropertyReports,
    confirmPropertyReport,
    rejectPropertyReport
};
