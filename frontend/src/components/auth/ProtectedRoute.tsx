import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-bright mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Checking authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your login status.
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the protected content
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: redirect to login
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600">
            Please sign in to access your Leedz dashboard and start generating leads.
          </p>
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg shadow-sm">
          <GoogleLoginButton>
            Sign in to continue
          </GoogleLoginButton>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our terms of service and can start generating up to 1000 leads per day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute; 