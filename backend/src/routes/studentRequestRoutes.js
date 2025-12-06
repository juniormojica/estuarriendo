import express from 'express';
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

// Get all student requests with filters
router.get('/', getAllStudentRequests);

// Get student request by ID
router.get('/:id', getStudentRequestById);

// Get requests by student ID
router.get('/student/:studentId', getStudentRequestsByStudentId);

// Create student request
router.post('/', createStudentRequest);

// Update student request
router.put('/:id', updateStudentRequest);

// Close student request
router.put('/:id/close', closeStudentRequest);

// Delete student request
router.delete('/:id', deleteStudentRequest);

export default router;
