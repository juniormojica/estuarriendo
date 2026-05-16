import { BrevoClient } from '@getbrevo/brevo';
import { AppError } from '../errors/AppError.js';

/**
 * Email Service using Brevo SDK (@getbrevo/brevo v2+)
 *
 * SDK API:
 *   const client = new BrevoClient({ apiKey });
 *   client.transactionalEmails.sendTransacEmail(payload);
 */

/**
 * Get a configured Brevo client instance
 * @returns {BrevoClient}
 */
const getBrevoClient = () => {
    if (!process.env.BREVO_API_KEY) {
        throw new AppError(
            'La configuración de correo no está disponible. Inténtalo más tarde.',
            500,
            'EMAIL_PROVIDER_NOT_CONFIGURED'
        );
    }

    return new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
};

/**
 * Sends a password reset email using Brevo SDK
 * @param {string} email - Destination email
 * @param {string} userName - Destination user name
 * @param {string} resetToken - The raw reset token
 * @returns {Promise<Object>} The response from Brevo
 */
export const sendPasswordResetEmail = async (email, userName, resetToken) => {
    const client = getBrevoClient();

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@estuarriendo.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'EstuArriendo';

    // Fallback to localhost if FRONTEND_URL is not defined
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Construct the password reset link
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const payload = {
        sender: {
            name: senderName,
            email: senderEmail
        },
        to: [
            {
                email: email,
                name: userName
            }
        ],
        subject: 'Recuperación de Contraseña - EstuArriendo',
        htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">EstuArriendo</h1>
                </div>
                <div style="padding: 30px 20px;">
                    <p style="font-size: 16px; color: #333;">Hola <strong>${userName}</strong>,</p>
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en EstuArriendo.</p>
                    <p style="font-size: 16px; color: #333; margin-bottom: 25px;">Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
                        <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
                    </p>
                    <p style="font-size: 14px; color: #888; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        Este enlace expirará en 1 hora.<br>
                        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                    </p>
                </div>
            </div>
        `
    };

    try {
        const data = await client.transactionalEmails.sendTransacEmail(payload);
        console.log(`Password reset email sent successfully to ${email}. Message ID: ${data.messageId}`);
        return data;
    } catch (error) {
        console.error('Error sending email with Brevo SDK:', error.message || error);
        throw new AppError(
            'Error al enviar el correo de recuperación. Por favor, inténtalo más tarde.',
            500,
            'EMAIL_SEND_FAILED'
        );
    }
};

export default {
    sendPasswordResetEmail
};
