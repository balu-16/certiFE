
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    allowedRoles?: string[];
    redirectTo?: string;
    requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles = [],
    redirectTo = '/login',
    requireAuth = true
}) => {
    const { isAuthenticated, userRole } = useAuth();
    const location = useLocation();

    // If this is an auth page (login/signup) and user is already logged in, redirect to dashboard
    if (!requireAuth && isAuthenticated) {
        if (userRole === 'student') {
            return <Navigate to="/user/dashboard" replace />;
        } else if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    // If this requires auth and user is not logged in, redirect to login
    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // If user is logged in but doesn't have the required role
    if (requireAuth && isAuthenticated && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                    <div className="text-red-600 text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Return children if provided (for backward compatibility), otherwise use Outlet for nested routes
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;