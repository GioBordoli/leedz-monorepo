import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // DEBUGGING: Capture all relevant information
    const debug = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      hasTokenInURL: searchParams.has('token'),
      tokenValue: searchParams.get('token')?.substring(0, 20) + '...', // First 20 chars only
      userState: user,
      isLoading,
      isAuthenticated,
      localStorage: {
        hasOnboardingData: !!localStorage.getItem(`onboarding_completed_${user?.id}`)
      }
    };
    
    setDebugInfo(debug);
    console.log('🔍 AUTH SUCCESS DEBUG:', debug);

    // Only redirect after authentication is confirmed and not loading
    if (!isLoading && isAuthenticated && user) {
      console.log('✅ Authentication confirmed, redirecting to dashboard...');
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500); // Slightly shorter delay

      return () => clearTimeout(timer);
    } else if (!isLoading && !isAuthenticated) {
      console.log('❌ Authentication failed, redirecting to home...');
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate, user, isLoading, isAuthenticated, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        {/* Show different states based on auth status */}
        {isLoading ? (
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Authentication...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your Google login.
            </p>
          </div>
        ) : isAuthenticated && user ? (
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Leedz! 🎉
            </h1>
            <p className="text-gray-600">
              Authentication successful. Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600">
              Something went wrong. Redirecting you back to the homepage...
            </p>
          </div>
        )}

        {user && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Signed in as:</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 text-gray-500 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {isLoading ? 'Processing...' : isAuthenticated ? 'Taking you to dashboard...' : 'Redirecting...'}
          </span>
        </div>

        {/* Debug Information (remove in production) */}
        <details className="mt-6 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer">Debug Info (click to expand)</summary>
          <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-mint hover:text-mint/80 text-sm font-medium block"
          >
            Go to dashboard immediately
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm block"
          >
            Back to homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess; 