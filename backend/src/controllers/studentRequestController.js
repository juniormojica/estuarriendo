import { StudentRequest, User, City, Institution, ActivityLog } from '../models/index.js';
import { StudentRequestStatus, UserType } from '../utils/enums.js';
import { Op } from 'sequelize';
import { badRequest, notFound, forbidden } from '../errors/AppError.js';

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

// Get requests by student ID — authenticated user must be the student or admin
export const getStudentRequestsByStudentId = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        if (req.auth.userId !== studentId) {
            const user = await User.findByPk(req.auth.userId, { attributes: ['userType'] });
            if (user?.userType !== UserType.ADMIN && user?.userType !== UserType.SUPER_ADMIN) {
                throw forbidden('Solo puedes ver tus propias solicitudes', { code: 'STUDENT_REQUEST_FORBIDDEN' });
            }
        }

        const requests = await StudentRequest.findAll({
            where: { studentId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        next(error);
    }
};

// Create student request — studentId is DERIVED from token, NEVER trust client-provided value
export const createStudentRequest = async (req, res, next) => {
    try {
        const requestData = req.body;
        const studentId = req.auth.userId;

        // Validate required fields (studentId is derived from auth, not body)
        const requiredFields = [
            'cityId',
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

        const student = await User.findByPk(studentId);
        if (!student) {
            throw notFound('Usuario no encontrado', { code: 'STUDENT_USER_NOT_FOUND' });
        }

        const request = await StudentRequest.create({
            ...requestData,
            studentId,
            status: StudentRequestStatus.OPEN,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        try {
            await ActivityLog.create({
                type: 'student_request_created',
                message: `Nueva solicitud estudiantil creada por ${studentId}`,
                userId: studentId,
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

// Update student request — ownership or admin required
export const updateStudentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            throw notFound('Student request not found', { code: 'STUDENT_REQUEST_NOT_FOUND' });
        }

        await assertOwnershipOrAdmin(req, request);

        updates.updatedAt = new Date();

        await request.update(updates);
        res.json(request);
    } catch (error) {
        next(error);
    }
};

// Close student request — ownership or admin required
export const closeStudentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            throw notFound('Student request not found', { code: 'STUDENT_REQUEST_NOT_FOUND' });
        }

        await assertOwnershipOrAdmin(req, request);

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

// Delete student request — ownership or admin required (admin panel uses this)
export const deleteStudentRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await StudentRequest.findByPk(id);
        if (!request) {
            throw notFound('Student request not found', { code: 'STUDENT_REQUEST_NOT_FOUND' });
        }

        await assertOwnershipOrAdmin(req, request);

        await request.destroy();
        res.json({ message: 'Student request deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const assertOwnershipOrAdmin = async (req, request) => {
    if (request.studentId === req.auth.userId) return;
    const user = await User.findByPk(req.auth.userId, { attributes: ['userType'] });
    if (user?.userType !== UserType.ADMIN && user?.userType !== UserType.SUPER_ADMIN) {
        throw forbidden('Solo puedes modificar tus propias solicitudes', { code: 'STUDENT_REQUEST_FORBIDDEN' });
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
