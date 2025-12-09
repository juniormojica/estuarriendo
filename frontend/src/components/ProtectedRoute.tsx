import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    const { user, loading } = useAuth();
    const location = useLocation();

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
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user type is allowed
    if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
        // Redirect to appropriate dashboard based on user type
        const redirectPath = user.userType === 'owner' ? '/dashboard' : '/';
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
