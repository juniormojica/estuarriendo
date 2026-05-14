import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireOwnerOrAdmin } from '../middleware/role.js';
import {
    getAllStudentRequests,
    getStudentRequestById,
    getStudentRequestsByStudentId,
    createStudentRequest,
    updateStudentRequest,
    closeStudentRequest,
    deleteStudentRequest
} from '../controllers/studentRequestController.js';

const router = express.Router();

// Protected — listing exposes sensitive student contact data (email, phone, whatsapp)
router.get('/', authMiddleware, requireOwnerOrAdmin, getAllStudentRequests);

// Protected — individual detail requires auth
router.get('/student/:studentId', authMiddleware, getStudentRequestsByStudentId);
router.get('/:id', authMiddleware, getStudentRequestById);

// Protected — create derives student identity from token
router.post('/', authMiddleware, createStudentRequest);

// Protected — mutations require auth + ownership
router.put('/:id/close', authMiddleware, closeStudentRequest);
router.put('/:id', authMiddleware, updateStudentRequest);
router.delete('/:id', authMiddleware, deleteStudentRequest);

export default router;
