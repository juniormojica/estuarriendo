'use client';
import React from 'react';
import { usePathname, redirect } from 'next/navigation';
import { useAppSelector } from '../store/hooks';
import authService from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    allowedUserTypes?: ('owner' | 'tenant' | 'admin' | 'superAdmin')[];
}

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true,
    allowedUserTypes
}) => {
    const { user: reduxUser, loading } = useAppSelector((state) => state.auth);
    const pathname = usePathname();

    // Fallback to localStorage if Redux user is null
    const storedUser = authService.getStoredUser();
    const user = reduxUser || storedUser;

    // Show loading state while checking authentication
    if (loading) {
        return (
import React from 'react';
import { usePathname, redirect } from 'next/navigation';
import { useAppSelector } from '../store/hooks';
import authService from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    allowedUserTypes?: ('owner' | 'tenant' | 'admin' | 'superAdmin')[];
}

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true,
    allowedUserTypes
}) => {
    const { user: reduxUser, loading } = useAppSelector((state) => state.auth);
    const pathname = usePathname();

    // Fallback to localStorage if Redux user is null
    const storedUser = authService.getStoredUser();
    const user = reduxUser || storedUser;

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to login if authentication is required but user is not authenticated
    if (requireAuth && !user) {
        redirect('/login');
    }

    // Check if user type is allowed
    if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
        // Redirect to appropriate dashboard based on user type
        const redirectPath = user.userType === 'owner' ? '/dashboard' : '/';
        redirect(redirectPath);
    }

    return <>{children}</>;
};

export default ProtectedRoute;
