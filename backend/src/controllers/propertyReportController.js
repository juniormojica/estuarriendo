import { User, Property, ContactUnlock, PropertyReport, CreditBalance, CreditTransaction } from '../models/index.js';
import { PropertyReportStatus, CreditTransactionType, ContactUnlockStatus, NotificationType } from '../utils/enums.js';
import { Notification } from '../models/index.js';
import { sequelize } from '../config/database.js';

/**
 * Tenants report a property as already rented or scam to get their credit refunded
 */
export const createPropertyReport = async (req, res) => {
    try {
        const { reporterId, propertyId, reason, description } = req.body;

        if (!reporterId || !propertyId || !reason) {
            return res.status(400).json({ error: 'reporterId, propertyId, and reason are required' });
        }

        // Ensure user actually unlocked this property
        const unlock = await ContactUnlock.findOne({
            where: { tenantId: reporterId, propertyId, status: ContactUnlockStatus.ACTIVE }
        });

        if (!unlock) {
            return res.status(403).json({ error: 'You must unlock the contact before reporting the property' });
        }

        // Ensure no existing pending report
        const existingReport = await PropertyReport.findOne({
            where: { reporterId, propertyId, status: PropertyReportStatus.PENDING }
        });

        if (existingReport) {
            return res.status(400).json({ error: 'You already have a pending report for this property' });
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

        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating property report:', error);
        res.status(500).json({ error: 'Failed to create report', message: error.message });
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
                { model: Property, as: 'property', attributes: ['id', 'title', 'ownerId'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(reports);
    } catch (error) {
        console.error('Error fetching property reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
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
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.status !== PropertyReportStatus.PENDING) {
            await t.rollback();
            return res.status(400).json({ error: 'Report is already processed' });
        }

        // 1. Mark report as confirmed
        report.status = PropertyReportStatus.CONFIRMED;
        report.adminNotes = adminNotes;
        report.processedBy = adminId;
        report.processedAt = new Date();

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
                type: NotificationType.PROPERTY_REPORTED,
                title: 'Propiedad marcada como arrendada',
                message: `Tu propiedad "${property.title}" ha sido marcada como arrendada debido al reporte de un usuario.`,
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
        res.status(500).json({ error: 'Failed to confirm report', message: error.message });
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
            return res.status(404).json({ error: 'Report not found' });
        }

        if (report.status !== PropertyReportStatus.PENDING) {
            return res.status(400).json({ error: 'Report is already processed' });
        }

        report.status = PropertyReportStatus.REJECTED;
        report.adminNotes = adminNotes;
        report.processedBy = adminId;
        report.processedAt = new Date();
        await report.save();

        const property = await Property.findByPk(report.propertyId);

        // Notify tenant
        await Notification.create({
            userId: report.reporterId,
            type: NotificationType.REPORT_RESOLVED,
            title: 'Reporte Rechazado',
            message: `Tu reporte sobre la propiedad "${property ? property.title : 'N/A'}" ha sido rechazado tras revisión.`,
            propertyId: report.propertyId,
            propertyTitle: property ? property.title : null,
            createdAt: new Date()
        });

        res.json(report);
    } catch (error) {
        console.error('Error rejecting report:', error);
        res.status(500).json({ error: 'Failed to reject report', message: error.message });
    }
};

export default {
    createPropertyReport,
    getPropertyReports,
    confirmPropertyReport,
    rejectPropertyReport
};
