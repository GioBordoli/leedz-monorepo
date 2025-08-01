import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Loader2 } from 'lucide-react';

interface GoogleLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  className = '', 
  children,
  variant = 'primary'
}) => {
  const { login, isLoading, error } = useAuth();

  const baseStyles = "flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-green-bright text-white hover:bg-green-600 hover:shadow-lg",
    secondary: "bg-white text-gray-800 border-2 border-gray-300 hover:border-green-bright hover:bg-green-50"
  };

  const handleLogin = (): void => {
    if (!isLoading) {
      login();
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting to Google...
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            {children || 'Sign in with Google'}
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton; 