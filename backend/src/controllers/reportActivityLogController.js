import { ReportActivityLog, User, PropertyReport } from '../models/index.js';
import { PropertyReportStatus } from '../utils/enums.js';

export const addReportActivity = async (req, res) => {
    try {
        const { id } = req.params; // reportId
        const { adminId, action, notes } = req.body;

        if (!adminId || !action || !notes) {
            return res.status(400).json({ error: 'adminId, action, and notes are required' });
        }

        const report = await PropertyReport.findByPk(id);
        if (!report) {
            return res.status(404).json({ error: 'Reporte no encontrado' });
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
        console.error('Error adding report activity:', error);
        res.status(500).json({ error: 'Error al registrar la actividad', message: error.message });
    }
};

export const getReportActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const logs = await ReportActivityLog.findAll({
            where: { reportId: id },
            include: [{ model: User, as: 'admin', attributes: ['id', 'name'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching report activity:', error);
        res.status(500).json({ error: 'Error al obtener el historial de actividades', message: error.message });
    }
};

export default {
    addReportActivity,
    getReportActivity
};
