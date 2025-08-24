export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  // 🆕 NEW ONBOARDING FIELDS
  hasCompletedOnboarding?: boolean;
  isFirstLogin?: boolean;
  needsOnboarding?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
} 