import { User } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

class AuthService {
  /**
   * Initiate Google OAuth login
   */
  login(): void {
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_URL}/auth/google`;
  }

  /**
   * Get current user info
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user info');
    }

    const data = await response.json();
    return data.user;
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to refresh token');
    }

    return response.json();
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Logout should work even if API call fails
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Validate JWT token format
   */
  isValidToken(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  /**
   * Extract token from URL query params (used after OAuth callback)
   */
  extractTokenFromURL(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && this.isValidToken(token)) {
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, document.title, url.pathname);
      return token;
    }
    
    return null;
  }
}

const authService = new AuthService();
export default authService; 