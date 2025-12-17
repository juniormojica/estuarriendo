import { StudentRequest, User, City, Institution } from '../models/index.js';
import { StudentRequestStatus } from '../utils/enums.js';
import { Op } from 'sequelize';

/**
 * StudentRequest Controller
 * Handles student housing requests for bidirectional marketplace
 */

// Get all student requests with filters
export const getAllStudentRequests = async (req, res) => {
    try {
        const {
            status,
            city,
            propertyType,
            minBudget,
            maxBudget,
            university,
            limit = 50,
            offset = 0
        } = req.query;

        const where = {};

        if (status) where.status = status;
        if (city) where.city = city;
        if (propertyType) where.propertyTypeDesired = propertyType;
        if (university) where.universityTarget = { [Op.iLike]: `%${university}%` };

        if (minBudget || maxBudget) {
            where.budgetMax = {};
            if (minBudget) where.budgetMax[Op.gte] = parseFloat(minBudget);
            if (maxBudget) where.budgetMax[Op.lte] = parseFloat(maxBudget);
        }

        const requests = await StudentRequest.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'student',
                    attributes: ['id', 'name', 'email', 'phone', 'whatsapp'],
                    required: false
                },
                {
                    model: City,
                    as: 'city',
                    attributes: ['id', 'name', 'departmentId'],
                    required: false
                },
                {
                    model: Institution,
                    as: 'institution',
                    attributes: ['id', 'name', 'type'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching student requests:', error);
        res.status(500).json({ error: 'Failed to fetch student requests', message: error.message });
    }
};

// Get student request by ID
export const getStudentRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await StudentRequest.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'student',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });

        if (!request) {
            return res.status(404).json({ error: 'Student request not found' });
        }

        res.json(request);
    } catch (error) {
        console.error('Error fetching student request:', error);
        res.status(500).json({ error: 'Failed to fetch student request', message: error.message });
    }
};

// Get requests by student ID
export const getStudentRequestsByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;

        const requests = await StudentRequest.findAll({
            where: { studentId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching student requests:', error);
        res.status(500).json({ error: 'Failed to fetch student requests', message: error.message });
    }
};

// Create student request
export const createStudentRequest = async (req, res) => {
    try {
        const requestData = req.body;

        // Validate required fields
        const requiredFields = [
            'studentName',
            'studentEmail',
            'city',
            'universityTarget',
            'budgetMax',
            'propertyTypeDesired',
            'moveInDate'
        ];

        for (const field of requiredFields) {
            if (!requestData[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // If studentId is provided, verify user exists
        if (requestData.studentId) {
            const student = await User.findByPk(requestData.studentId);
            if (!student) {
                return res.status(404).json({ error: 'Student user not found' });
            }
        }

        const request = await StudentRequest.create({
            ...requestData,
            status: StudentRequestStatus.OPEN,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating student request:', error);
        res.status(500).json({ error: 'Failed to create student request', message: error.message });
    }
};

// Update student request
export const updateStudentRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ error: 'Student request not found' });
        }

        updates.updatedAt = new Date();

        await request.update(updates);
        res.json(request);
    } catch (error) {
        console.error('Error updating student request:', error);
        res.status(500).json({ error: 'Failed to update student request', message: error.message });
    }
};

// Close student request
export const closeStudentRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ error: 'Student request not found' });
        }

        await request.update({
            status: StudentRequestStatus.CLOSED,
            updatedAt: new Date()
        });

        res.json({
            message: 'Student request closed successfully',
            request
        });
    } catch (error) {
        console.error('Error closing student request:', error);
        res.status(500).json({ error: 'Failed to close student request', message: error.message });
    }
};

// Delete student request
export const deleteStudentRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ error: 'Student request not found' });
        }

        await request.destroy();
        res.json({ message: 'Student request deleted successfully' });
    } catch (error) {
        console.error('Error deleting student request:', error);
        res.status(500).json({ error: 'Failed to delete student request', message: error.message });
    }
};

export default {
    getAllStudentRequests,
    getStudentRequestById,
    getStudentRequestsByStudentId,
    createStudentRequest,
    updateStudentRequest,
    closeStudentRequest,
    deleteStudentRequest
};
