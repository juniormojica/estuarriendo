import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, { LoginCredentials, RegisterData, AuthResponse } from '../../services/authService';
import { User } from '../../types';

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: authService.getStoredUser(),
    token: authService.getToken(),
    loading: false,
    error: null,
    isAuthenticated: !!authService.getToken(),
};

// Async Thunks
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al iniciar sesión');
        }
    }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterData>(
    'auth/register',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authService.register(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al registrar usuario');
        }
    }
);

export const getCurrentUser = createAsyncThunk<User, void>(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.getCurrentUser();
            return user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al obtener usuario');
        }
    }
);

export const forgotPassword = createAsyncThunk<{ message: string; token?: string }, string>(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authService.forgotPassword(email);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al solicitar recuperación');
        }
    }
);

export const resetPassword = createAsyncThunk<{ message: string }, { token: string; newPassword: string }>(
    'auth/resetPassword',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authService.resetPassword(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Error al resetear contraseña');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            authService.logout();
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Get Current User
        builder
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                authService.logout();
            });

        // Forgot Password
        builder
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Reset Password
        builder
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
