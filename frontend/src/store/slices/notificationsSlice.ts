import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';
import { api } from '../../services/api';
import { authService } from '../../services/authService';

interface NotificationsState {
    items: Notification[];
    loading: boolean;
    error: string | null;
    unreadCount: number;
    lastFetched: number | null;
}

const initialState: NotificationsState = {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0,
    lastFetched: null
};

// Thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = authService.getStoredUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            const notifications = await api.getNotifications(currentUser.id);
            return notifications;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch notifications');
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = authService.getStoredUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            const response = await api.getUnreadNotificationCount(currentUser.id);
            return response.count;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch unread count');
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await api.markNotificationAsRead(notificationId);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to mark notification as read');
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const currentUser = authService.getStoredUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }
            await api.markAllNotificationsAsRead(currentUser.id);
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to mark all as read');
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await api.deleteNotification(notificationId);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete notification');
        }
    }
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
            state.error = null;
        },
        updateUnreadCount: (state) => {
            state.unreadCount = state.items.filter(n => !n.read).length;
        }
    },
    extraReducers: (builder) => {
        // Fetch notifications
        builder.addCase(fetchNotifications.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
            state.loading = false;
            state.items = action.payload;
            state.unreadCount = action.payload.filter(n => !n.read).length;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchNotifications.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch unread count
        builder.addCase(fetchUnreadCount.fulfilled, (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        });

        // Mark as read
        builder.addCase(markAsRead.fulfilled, (state, action: PayloadAction<string>) => {
            const notification = state.items.find(n => n.id === action.payload);
            if (notification) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        });

        // Mark all as read
        builder.addCase(markAllAsRead.fulfilled, (state) => {
            state.items = state.items.map(n => ({ ...n, read: true }));
            state.unreadCount = 0;
        });

        // Delete notification
        builder.addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
            const notification = state.items.find(n => n.id === action.payload);
            if (notification && !notification.read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.items = state.items.filter(n => n.id !== action.payload);
        });
    }
});

export const { clearNotifications, updateUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
