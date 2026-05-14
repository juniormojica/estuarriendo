import { ReportActivityLog, User, PropertyReport } from '../models/index.js';
import { PropertyReportStatus } from '../utils/enums.js';
import { badRequest, notFound } from '../errors/AppError.js';

export const addReportActivity = async (req, res, next) => {
    try {
        const { id } = req.params; // reportId
        const adminId = req.auth.userId;
        const { action, notes } = req.body;

        if (!action || !notes) {
            throw badRequest('action and notes are required', {
                code: 'REPORT_ACTIVITY_VALIDATION_ERROR'
            });
        }

        const report = await PropertyReport.findByPk(id);
        if (!report) {
            throw notFound('Reporte no encontrado', { code: 'REPORT_NOT_FOUND' });
        }

        // Add the log
        const log = await ReportActivityLog.create({
            reportId: id,
            adminId,
            action,
            notes
        });

        // Automatically change status to investigating if it was pending
        if (report.status === PropertyReportStatus.PENDING) {
            report.status = PropertyReportStatus.INVESTIGATING;
            await report.save();
        }

        // Fetch the created log with admin info
        const populatedLog = await ReportActivityLog.findByPk(log.id, {
            include: [{ model: User, as: 'admin', attributes: ['id', 'name'] }]
        });

        res.status(201).json(populatedLog);
    } catch (error) {
        next(error);
    }
};

export const getReportActivity = async (req, res, next) => {
    try {
        const { id } = req.params;

        const logs = await ReportActivityLog.findAll({
            where: { reportId: id },
            include: [{ model: User, as: 'admin', attributes: ['id', 'name'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(logs);
    } catch (error) {
        next(error);
    }
};

export default {
    addReportActivity,
    getReportActivity
};
