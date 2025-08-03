import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, User } from '../types/auth';
import authService from '../services/authService';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for existing auth
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to store token in localStorage
  const storeToken = (token: string) => {
    localStorage.setItem('authToken', token);
  };

  // Helper function to remove token from localStorage
  const removeToken = () => {
    localStorage.removeItem('authToken');
  };

  // Helper function to get token from localStorage
  const getStoredToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  // Check for token in URL (OAuth callback) or localStorage on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 AUTH CONTEXT: Starting auth check...');
      
      try {
        // First check if we have a token from OAuth callback
        const tokenFromURL = authService.extractTokenFromURL();
        console.log('🔍 AUTH CONTEXT: Token from URL:', tokenFromURL ? 'Found' : 'Not found');
        
        if (tokenFromURL) {
          console.log('🔍 AUTH CONTEXT: Attempting to get user info from URL token...');
          // Get user info with the token
          const user = await authService.getCurrentUser(tokenFromURL);
          console.log('🔍 AUTH CONTEXT: User info received:', user);
          
          // Store the token for future use
          storeToken(tokenFromURL);
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token: tokenFromURL }
          });
          console.log('✅ AUTH CONTEXT: Login success dispatched');
        } else {
          // Check for existing session in localStorage
          console.log('🔍 AUTH CONTEXT: No URL token, checking localStorage...');
          const storedToken = getStoredToken();
          
          if (storedToken) {
            console.log('🔍 AUTH CONTEXT: Found stored token, validating...');
            try {
              // Validate the stored token by getting user info
              const user = await authService.getCurrentUser(storedToken);
              console.log('🔍 AUTH CONTEXT: Stored token is valid, user:', user);
              
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token: storedToken }
              });
              console.log('✅ AUTH CONTEXT: Session restored from localStorage');
            } catch (tokenError) {
              console.log('❌ AUTH CONTEXT: Stored token is invalid, removing...');
              removeToken();
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } else {
            console.log('🔍 AUTH CONTEXT: No stored token found');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } catch (error) {
        console.error('❌ AUTH CONTEXT: Auth check failed:', error);
        removeToken(); // Clear any invalid stored token
        dispatch({
          type: 'LOGIN_ERROR',
          payload: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = (): void => {
    dispatch({ type: 'LOGIN_START' });
    authService.login(); // This will redirect to Google OAuth
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken(); // Clear stored token
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    if (!state.token) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await authService.refreshToken(state.token);
      const newToken = response.token;
      
      // Store the new token
      storeToken(newToken);
      
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: { user: response.user, token: newToken }
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      removeToken(); // Clear invalid token
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error instanceof Error ? error.message : 'Token refresh failed'
      });
      // If refresh fails, logout the user
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 