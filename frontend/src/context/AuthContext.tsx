import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import authService, { LoginCredentials, RegisterData, AuthResponse } from '../services/authService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (data: RegisterData) => Promise<AuthResponse>;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = () => {
            const token = authService.getToken();
            const storedUser = authService.getStoredUser();

            // Only use stored user, don't verify with backend on initial load
            // This prevents unnecessary 401 errors on public pages
            // The token will be verified when the user actually tries to access protected resources
            if (token && storedUser) {
                setUser(storedUser);
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            return response;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al iniciar sesión';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterData): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);

        try {
            const response = await authService.register(data);
            setUser(response.user);
            return response;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al registrar usuario';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setError(null);
    };

    const refreshUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (err) {
            // If refresh fails, logout
            logout();
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
