'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from 'react-error-boundary';
import GlobalErrorFallback from '@/components/GlobalErrorFallback';
import { useEffect } from 'react';
import { getCurrentUser } from '@/store/slices/authSlice';
import authService from '@/services/authService';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      store.dispatch(getCurrentUser() as any);
    }
  }, []);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <Provider store={store}>
        <ToastProvider>
          <FavoritesProvider>
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </FavoritesProvider>
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
}
