import { afterEach, describe, expect, it, vi } from 'vitest';
import * as paymentRequestController from './paymentRequestController.js';
import { PaymentRequest, User } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { PaymentRequestStatus } from '../utils/enums.js';

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

describe('paymentRequestController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates get by id not-found flow to standardized 404 contract', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockResolvedValue(null);

        const req = { auth: { userId: 'u-1' }, params: { id: 'missing-id' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.getPaymentRequestById,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Payment request not found',
            message: 'Payment request not found',
            code: 'PAYMENT_REQUEST_NOT_FOUND'
        });
    });

    it('delegates list unexpected errors to internal-error contract', async () => {
        vi.spyOn(PaymentRequest, 'findAll').mockRejectedValue(new Error('sequelize: connection password=secret'));

        const req = { query: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.getAllPaymentRequests,
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

    it('delegates user list unexpected errors to internal-error contract', async () => {
        vi.spyOn(PaymentRequest, 'findAll').mockRejectedValue(new Error('db exploded'));

        const req = { auth: { userId: 'u-1' }, params: { userId: 'u-1' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.getUserPaymentRequests,
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

    it('delegates create required-field validation to standardized 400 contract', async () => {
        const req = {
            auth: { userId: 'u-1' },
            body: {
                amount: 1000,
                planType: 'monthly',
                referenceCode: 'ref-1'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.createPaymentRequest,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Faltan campos requeridos',
            message: 'Faltan campos requeridos',
            code: 'PAYMENT_REQUEST_REQUIRED_FIELDS_MISSING'
        });
    });

    it('delegates create user-not-found flow to standardized 404 contract', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue(null);

        const req = {
            auth: { userId: 'missing-user' },
            body: {
                amount: 1000,
                planType: 'monthly',
                planDuration: 30,
                referenceCode: 'ref-1',
                paymentMethod: 'mercado_pago'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.createPaymentRequest,
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

    it('delegates create unexpected errors to internal-error contract', async () => {
        vi.spyOn(User, 'findByPk').mockRejectedValue(new Error('db unavailable'));

        const req = {
            auth: { userId: 'u-1' },
            body: {
                amount: 1000,
                planType: 'monthly',
                planDuration: 30,
                referenceCode: 'ref-1',
                paymentMethod: 'mercado_pago'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.createPaymentRequest,
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

    it('delegates verify not-found flow to standardized 404 contract', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'missing-payment-request' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.verifyPaymentRequest,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Payment request not found',
            message: 'Payment request not found',
            code: 'PAYMENT_REQUEST_NOT_FOUND'
        });
    });

    it('delegates verify already-processed validation to standardized 400 contract', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockResolvedValue({
            status: PaymentRequestStatus.VERIFIED
        });

        const req = { params: { id: 'already-processed' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.verifyPaymentRequest,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Payment request already processed',
            message: 'Payment request already processed',
            code: 'PAYMENT_REQUEST_ALREADY_PROCESSED'
        });
    });

    it('delegates verify unexpected errors to internal-error contract', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockRejectedValue(new Error('verify path exploded'));

        const req = { params: { id: 'pr-1' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.verifyPaymentRequest,
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

    it('delegates reject not-found flow to standardized 404 contract', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'missing-payment-request' }, body: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.rejectPaymentRequest,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Payment request not found',
            message: 'Payment request not found',
            code: 'PAYMENT_REQUEST_NOT_FOUND'
        });
    });

    it('delegates reject already-processed validation to standardized 400 contract', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockResolvedValue({
            status: PaymentRequestStatus.REJECTED
        });

        const req = { params: { id: 'already-processed' }, body: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.rejectPaymentRequest,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Payment request already processed',
            message: 'Payment request already processed',
            code: 'PAYMENT_REQUEST_ALREADY_PROCESSED'
        });
    });

    it('delegates reject unexpected errors to internal-error contract', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockRejectedValue(new Error('reject path exploded'));

        const req = { params: { id: 'pr-1' }, body: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            paymentRequestController.rejectPaymentRequest,
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

    it('rejects getPaymentRequestById cross-user access with 403', async () => {
        vi.spyOn(PaymentRequest, 'findByPk').mockResolvedValue({
            id: 1,
            userId: 'owner-user',
            amount: 1000,
            planType: 'monthly',
            status: PaymentRequestStatus.PENDING
        });

        const req = { auth: { userId: 'other-user' }, params: { id: '1' } };

        await paymentRequestController.getPaymentRequestById(req, createResponse(), (error) => {
            expect(error.statusCode).toBe(403);
            expect(error.code).toBe('PAYMENT_REQUEST_VIEW_FORBIDDEN');
        });
    });

    it('rejects getUserPaymentRequests cross-user access with 403', async () => {
        const req = { auth: { userId: 'self' }, params: { userId: 'other-user' } };

        await paymentRequestController.getUserPaymentRequests(req, createResponse(), (error) => {
            expect(error.statusCode).toBe(403);
            expect(error.code).toBe('PAYMENT_REQUEST_USER_LIST_FORBIDDEN');
        });
    });
});
