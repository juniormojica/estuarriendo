import { OAuth2Client } from 'google-auth-library';

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
            const error = new Error('Token de Google inválido');
            error.statusCode = 401;
            throw error;
        }

        if (!payload.email_verified) {
            const error = new Error('El correo de Google no está verificado');
            error.statusCode = 401;
            throw error;
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified,
        };
    } catch (error) {
        if (error.statusCode) throw error;
        const err = new Error('No se pudo verificar el token de Google');
        err.statusCode = 401;
        throw err;
    }
};

export default { verifyGoogleToken };
