import { StudentRequest, User, City, Institution, ActivityLog } from '../models/index.js';
import { StudentRequestStatus } from '../utils/enums.js';
import { Op } from 'sequelize';
import { badRequest, notFound } from '../errors/AppError.js';

/**
 * StudentRequest Controller
 * Handles student housing requests for bidirectional marketplace
 */

// Get all student requests with filters
export const getAllStudentRequests = async (req, res, next) => {
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
        next(error);
    }
};

// Get student request by ID
export const getStudentRequestById = async (req, res, next) => {
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
            throw notFound('Student request not found', { code: 'STUDENT_REQUEST_NOT_FOUND' });
        }

        res.json(request);
    } catch (error) {
        next(error);
    }
};

// Get requests by student ID
export const getStudentRequestsByStudentId = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        const requests = await StudentRequest.findAll({
            where: { studentId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// Create student request
export const createStudentRequest = async (req, res, next) => {
    try {
        const requestData = req.body;

        // Validate required fields (normalized schema)
        const requiredFields = [
            'studentId',        // Required - references User table
            'cityId',           // Required - references City table
            'budgetMax',
            'propertyTypeDesired',
            'moveInDate'
        ];

        for (const field of requiredFields) {
            if (!requestData[field]) {
                throw badRequest(`${field} is required`, {
                    code: 'STUDENT_REQUEST_VALIDATION_ERROR'
                });
            }
        }

        // If studentId is provided, verify user exists
        if (requestData.studentId) {
            const student = await User.findByPk(requestData.studentId);
            if (!student) {
                throw notFound('Student user not found', { code: 'STUDENT_USER_NOT_FOUND' });
            }
        }

        const request = await StudentRequest.create({
            ...requestData,
            status: StudentRequestStatus.OPEN,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        try {
            await ActivityLog.create({
                type: 'student_request_created',
                message: `Nueva solicitud estudiantil creada por ${requestData.studentId}`,
                userId: requestData.studentId,
                timestamp: new Date()
            });
        } catch (activityError) {
            console.error('Error creating activity log:', activityError);
        }

        res.status(201).json(request);
    } catch (error) {
        next(error);
    }
};

// Update student request
export const updateStudentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            throw notFound('Student request not found', { code: 'STUDENT_REQUEST_NOT_FOUND' });
        }

        updates.updatedAt = new Date();

        await request.update(updates);
        res.json(request);
    } catch (error) {
        next(error);
    }
};

// Close student request
export const closeStudentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            throw notFound('Student request not found', { code: 'STUDENT_REQUEST_NOT_FOUND' });
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
        next(error);
    }
};

// Delete student request
export const deleteStudentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            throw notFound('Student request not found', { code: 'STUDENT_REQUEST_NOT_FOUND' });
        }

        await request.destroy();
        res.json({ message: 'Student request deleted successfully' });
    } catch (error) {
        next(error);
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
