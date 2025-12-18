import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import amenitiesReducer from './slices/amenitiesSlice';
import propertiesReducer from './slices/propertiesSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        amenities: amenitiesReducer,
        properties: propertiesReducer,
        notifications: notificationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
