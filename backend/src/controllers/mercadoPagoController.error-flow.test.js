import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../middleware/errorHandler.js';

const paymentGetMock = vi.fn();

vi.mock('mercadopago', () => {
    return {
        MercadoPagoConfig: class {},
        Preference: class {
            create = vi.fn();
        },
        PreApproval: class {},
        Payment: class {
            get = paymentGetMock;
        }
    };
});

const mercadoPagoController = await import('./mercadoPagoController.js');

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

describe('mercadoPagoController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        paymentGetMock.mockReset();
    });

    it('delegates createCheckoutLink required-field validation to standardized 400 contract', async () => {
        const req = { body: { planType: 'weekly' } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            mercadoPagoController.createCheckoutLink,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Faltan campos requeridos (userId, planType)',
            message: 'Faltan campos requeridos (userId, planType)',
            code: 'MP_CHECKOUT_VALIDATION_ERROR'
        });
    });

    it('delegates createCheckoutLink unknown plan flow to standardized 400 contract', async () => {
        const req = { body: { userId: 10, planType: 'invalid_plan' } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            mercadoPagoController.createCheckoutLink,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Plan no reconocido',
            message: 'Plan no reconocido',
            code: 'MP_PLAN_NOT_RECOGNIZED'
        });
    });

    it('delegates verifyPaymentManually missing paymentId to standardized 400 contract', async () => {
        const req = { params: {} };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            mercadoPagoController.verifyPaymentManually,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'paymentId es requerido',
            message: 'paymentId es requerido',
            code: 'MP_PAYMENT_ID_REQUIRED'
        });
    });

    it('delegates verifyPaymentManually unexpected SDK errors to centralized internal-error contract', async () => {
        paymentGetMock.mockRejectedValue(new Error('sdk exploded with token abc123'));

        const req = { params: { paymentId: '12345' } };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            mercadoPagoController.verifyPaymentManually,
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
