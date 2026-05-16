import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sendTransacEmail = vi.fn();

vi.mock('@getbrevo/brevo', () => ({
    BrevoClient: vi.fn(() => ({
        transactionalEmails: {
            sendTransacEmail
        }
    }))
}));

import { sendPasswordResetEmail } from './emailService.js';

describe('emailService semantic errors', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.restoreAllMocks();
    });

    it('throws EMAIL_PROVIDER_NOT_CONFIGURED when BREVO_API_KEY is missing', async () => {
        delete process.env.BREVO_API_KEY;

        await expect(sendPasswordResetEmail('test@example.com', 'Test User', 'token-123')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 500,
            code: 'EMAIL_PROVIDER_NOT_CONFIGURED',
            message: 'La configuración de correo no está disponible. Inténtalo más tarde.'
        });
    });

    it('throws EMAIL_SEND_FAILED with generic user-facing message on provider failure', async () => {
        process.env.BREVO_API_KEY = 'brevo-key';
        sendTransacEmail.mockRejectedValueOnce(new Error('Brevo down'));

        await expect(sendPasswordResetEmail('test@example.com', 'Test User', 'token-123')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 500,
            code: 'EMAIL_SEND_FAILED',
            message: 'Error al enviar el correo de recuperación. Por favor, inténtalo más tarde.'
        });
    });
});
