import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, Loader2 } from 'lucide-react';

const AuthSuccess: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Redirect to dashboard after successful authentication
    if (isAuthenticated && user && !isLoading) {
      // For now, redirect to home. Later this will be the dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-bright mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Completing Sign In...
          </h1>
          <p className="text-gray-600">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <CheckCircle className="w-16 h-16 text-green-bright mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Leedz!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Hello, {user.name}!
          </p>
          <p className="text-gray-600 mb-8">
            You've successfully signed in. Redirecting you to your dashboard...
          </p>
          
          <div className="bg-translucent-green border border-green-accent rounded-lg p-4">
            <p className="text-sm text-gray-700">
              🎯 You can now generate up to <strong>1000 leads per day</strong> and stream them directly to your Google Sheets!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if something went wrong
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          Something went wrong during sign in. Please try again.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-green-bright text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default AuthSuccess; 