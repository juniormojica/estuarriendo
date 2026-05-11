import { afterEach, describe, expect, it, vi } from 'vitest';
import * as verificationController from './verificationController.js';
import { UserVerificationDocuments, User } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const runThroughErrorHandler = async (controllerAction, { req }) => {
    const res = createResponse();
    let capturedError;

    await controllerAction(req, res, (error) => {
        capturedError = error;
    });

    const statusCallsBeforeHandler = res.status.mock.calls.length;
    const jsonCallsBeforeHandler = res.json.mock.calls.length;

    errorHandler(capturedError, req, res, vi.fn());

    return { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler };
};

describe('verificationController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates getVerificationDocuments missing-docs flow to centralized handler', async () => {
        vi.spyOn(UserVerificationDocuments, 'findByPk').mockResolvedValue(null);

        const req = { params: { userId: '999' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.getVerificationDocuments,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Verification documents not found',
            message: 'Verification documents not found',
            code: 'VERIFICATION_DOCUMENTS_NOT_FOUND'
        });
    });

    it('delegates getVerificationProgress missing-user flow to centralized handler', async () => {
        vi.spyOn(UserVerificationDocuments, 'findByPk').mockResolvedValue(null);
        vi.spyOn(User, 'findByPk').mockResolvedValue(null);

        const req = { params: { userId: '404' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.getVerificationProgress,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
            message: 'User not found',
            code: 'USER_NOT_FOUND'
        });
    });

    it('delegates unexpected getVerificationDocuments errors to centralized handler internal-error contract', async () => {
        vi.spyOn(UserVerificationDocuments, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = { params: { userId: '10' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.getVerificationDocuments,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates unexpected getPendingVerifications errors to centralized handler internal-error contract', async () => {
        vi.spyOn(User, 'findAll').mockRejectedValue(new Error('db exploded with internals'));

        const req = { params: {}, query: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.getPendingVerifications,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates approveVerification missing-user flow to centralized handler', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue(null);

        const req = { params: { userId: '404' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.approveVerification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
            message: 'User not found',
            code: 'USER_NOT_FOUND'
        });
    });

    it('delegates approveVerification missing-docs flow to centralized handler', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 1, name: 'Test User' });
        vi.spyOn(UserVerificationDocuments, 'findByPk').mockResolvedValue(null);

        const req = { params: { userId: '1' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.approveVerification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Verification documents not found',
            message: 'Verification documents not found',
            code: 'VERIFICATION_DOCUMENTS_NOT_FOUND'
        });
    });

    it('delegates unexpected approveVerification errors to centralized handler internal-error contract', async () => {
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = { params: { userId: '10' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.approveVerification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates rejectVerification missing-reason flow to centralized handler', async () => {
        const req = { params: { userId: '1' }, body: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.rejectVerification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Rejection reason is required',
            message: 'Rejection reason is required',
            code: 'REJECTION_REASON_REQUIRED'
        });
    });

    it('delegates rejectVerification missing-user flow to centralized handler', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue(null);

        const req = { params: { userId: '404' }, body: { reason: 'invalid docs' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.rejectVerification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
            message: 'User not found',
            code: 'USER_NOT_FOUND'
        });
    });

    it('delegates unexpected rejectVerification errors to centralized handler internal-error contract', async () => {
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = { params: { userId: '10' }, body: { reason: 'invalid docs' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.rejectVerification,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates submitVerificationDocuments missing-required-documents flow to centralized handler', async () => {
        const req = {
            body: {
                userId: '1',
                idFront: 'front-url',
                // idBack missing on purpose
                selfie: 'selfie-url'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.submitVerificationDocuments,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'ID Front, ID Back and Selfie are required',
            message: 'ID Front, ID Back and Selfie are required',
            code: 'VERIFICATION_REQUIRED_DOCUMENTS_MISSING'
        });
    });

    it('delegates submitVerificationDocuments missing-user flow to centralized handler', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue(null);

        const req = {
            body: {
                userId: '404',
                idFront: 'front-url',
                idBack: 'back-url',
                selfie: 'selfie-url'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.submitVerificationDocuments,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'User not found',
            message: 'User not found',
            code: 'USER_NOT_FOUND'
        });
    });

    it('delegates unexpected submitVerificationDocuments errors to centralized handler internal-error contract', async () => {
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = {
            body: {
                userId: '10',
                idFront: 'front-url',
                idBack: 'back-url',
                selfie: 'selfie-url'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.submitVerificationDocuments,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates submitSingleDocument missing-required-fields flow to centralized handler', async () => {
        const req = {
            body: {
                userId: '1',
                documentType: 'idFront'
                // documentUrl missing on purpose
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.submitSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Missing required fields',
            message: 'Missing required fields',
            code: 'VERIFICATION_REQUIRED_FIELDS_MISSING'
        });
    });

    it('delegates submitSingleDocument invalid-document-type flow to centralized handler', async () => {
        const req = {
            body: {
                userId: '1',
                documentType: 'passport',
                documentUrl: 'passport-url'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.submitSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid document type',
            message: 'Invalid document type',
            code: 'VERIFICATION_INVALID_DOCUMENT_TYPE'
        });
    });

    it('delegates submitSingleDocument already-approved-document flow to centralized handler', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({
            id: 1,
            name: 'Tenant',
            verificationStatus: 'in_progress'
        });
        vi.spyOn(UserVerificationDocuments, 'findOrCreate').mockResolvedValue([
            {
                idFrontStatus: 'approved'
            },
            false
        ]);

        const req = {
            body: {
                userId: '1',
                documentType: 'idFront',
                documentUrl: 'front-url'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.submitSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Document is already approved and cannot be modified',
            message: 'Document is already approved and cannot be modified',
            code: 'VERIFICATION_DOCUMENT_ALREADY_APPROVED'
        });
    });

    it('delegates unexpected submitSingleDocument errors to centralized handler internal-error contract', async () => {
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = {
            body: {
                userId: '10',
                documentType: 'idFront',
                documentUrl: 'front-url'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.submitSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('delegates reviewSingleDocument missing-required-fields flow to centralized handler', async () => {
        const req = {
            params: { userId: '1' },
            body: {
                documentType: 'idFront'
                // status missing on purpose
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.reviewSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Missing required fields',
            message: 'Missing required fields',
            code: 'VERIFICATION_REQUIRED_FIELDS_MISSING'
        });
    });

    it('delegates reviewSingleDocument invalid-document-type flow to centralized handler', async () => {
        const req = {
            params: { userId: '1' },
            body: {
                documentType: 'passport',
                status: 'approved'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.reviewSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid document type',
            message: 'Invalid document type',
            code: 'VERIFICATION_INVALID_DOCUMENT_TYPE'
        });
    });

    it('delegates reviewSingleDocument rejection-missing-reason flow to centralized handler', async () => {
        const req = {
            params: { userId: '1' },
            body: {
                documentType: 'idFront',
                status: 'rejected'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.reviewSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Reason is required when rejecting a document',
            message: 'Reason is required when rejecting a document',
            code: 'VERIFICATION_REJECTION_REASON_REQUIRED'
        });
    });

    it('delegates reviewSingleDocument missing-docs-or-user flow to centralized handler', async () => {
        vi.spyOn(UserVerificationDocuments, 'findByPk').mockResolvedValue(null);
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 1, userType: 'tenant', verificationStatus: 'in_progress' });

        const req = {
            params: { userId: '1' },
            body: {
                documentType: 'idFront',
                status: 'approved'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.reviewSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Documentation or user not found',
            message: 'Documentation or user not found',
            code: 'VERIFICATION_DOCUMENTS_OR_USER_NOT_FOUND'
        });
    });

    it('delegates unexpected reviewSingleDocument errors to centralized handler internal-error contract', async () => {
        vi.spyOn(UserVerificationDocuments, 'findByPk').mockRejectedValue(new Error('db exploded with internals'));

        const req = {
            params: { userId: '10' },
            body: {
                documentType: 'idFront',
                status: 'approved'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            verificationController.reviewSingleDocument,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});
