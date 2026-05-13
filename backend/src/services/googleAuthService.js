import { OAuth2Client } from 'google-auth-library';
import { AppError, unauthorized } from '../errors/AppError.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Google Authentication Service
 * Verifies Google ID tokens and extracts user profile information
 */

/**
 * Verify a Google ID token and return the user's profile data
 * @param {string} credential - The Google ID token (credential) from Google Identity Services
 * @returns {Promise<Object>} User profile data from Google
 * @throws {Error} If the token is invalid or expired
 */
export const verifyGoogleToken = async (credential) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            throw unauthorized('Token de Google inválido', {
                code: 'AUTH_GOOGLE_TOKEN_INVALID'
            });
        }

        if (!payload.email_verified) {
            throw unauthorized('El correo de Google no está verificado', {
                code: 'AUTH_GOOGLE_EMAIL_NOT_VERIFIED'
            });
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw unauthorized('No se pudo verificar el token de Google', {
            code: 'AUTH_GOOGLE_TOKEN_VERIFICATION_FAILED',
            cause: error
        });
    }
};

export default { verifyGoogleToken };
