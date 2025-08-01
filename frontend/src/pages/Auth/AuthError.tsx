import React from 'react';
import { XCircle } from 'lucide-react';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

const AuthError: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Authentication Failed
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn't sign you in with Google. This might be due to:
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• You denied permission to access your Google account</li>
            <li>• There was a temporary issue with Google's servers</li>
            <li>• Your browser blocked the authentication popup</li>
            <li>• Network connectivity issues</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <GoogleLoginButton>
            Try Signing In Again
          </GoogleLoginButton>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@leedz.online" className="text-green-bright hover:underline">
              support@leedz.online
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthError; 