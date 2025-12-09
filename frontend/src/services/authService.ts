import apiClient from '../lib/axios';
import { User } from '../types';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone: string;
    userType: 'owner' | 'tenant';
    whatsapp?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ForgotPasswordResponse {
    message: string;
    token?: string; // Only in development
    email?: string; // Only in development
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls to the backend
 */
export const authService = {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);

        // Save token and user to localStorage
        if (response.data.token) {
            localStorage.setItem('estuarriendo_token', response.data.token);
            localStorage.setItem('estuarriendo_current_user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

        // Save token and user to localStorage
        if (response.data.token) {
            localStorage.setItem('estuarriendo_token', response.data.token);
            localStorage.setItem('estuarriendo_current_user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>('/auth/me');

        // Update user in localStorage
        localStorage.setItem('estuarriendo_current_user', JSON.stringify(response.data));

        return response.data;
    },

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem('estuarriendo_token');
        localStorage.removeItem('estuarriendo_current_user');
    },

    /**
     * Request password reset
     */
    async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
        const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Verify reset token
     */
    async verifyResetToken(token: string): Promise<{ valid: boolean; email: string }> {
        const response = await apiClient.get(`/auth/reset-password/${token}`);
        return response.data;
    },

    /**
     * Reset password with token
     */
    async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
        const response = await apiClient.post('/auth/reset-password', data);
        return response.data;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem('estuarriendo_token');
        return !!token;
    },

    /**
     * Get stored token
     */
    getToken(): string | null {
        return localStorage.getItem('estuarriendo_token');
    },

    /**
     * Get stored user
     */
    getStoredUser(): User | null {
        const stored = localStorage.getItem('estuarriendo_current_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing stored user:', e);
                return null;
            }
        }
        return null;
    }
};

export default authService;
