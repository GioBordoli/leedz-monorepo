/**
 * Authentication Debug Utility
 * Helps diagnose authentication flow issues
 */

export const debugAuth = {
  /**
   * Test backend connection and configuration
   */
  async testBackendConnection() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    console.log('🔍 Testing backend connection...');
    
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Backend connection status:', response.status);
      return { success: true, status: response.status, url: API_URL };
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return { success: false, error, url: API_URL };
    }
  },

  /**
   * Test Google OAuth redirect URL
   */
  testOAuthRedirect() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const oauthUrl = `${API_URL}/auth/google`;
    
    console.log('🔍 OAuth URL:', oauthUrl);
    console.log('🔍 Current frontend URL:', window.location.origin);
    
    return {
      oauthUrl,
      frontendUrl: window.location.origin,
      expectedCallback: `${window.location.origin}/auth/success`
    };
  },

  /**
   * Simulate token validation
   */
  validateTokenFormat(token: string) {
    console.log('🔍 Validating token format...');
    
    const parts = token.split('.');
    const isValidJWT = parts.length === 3;
    
    try {
      // Try to decode JWT header and payload (not signature verification)
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('✅ JWT Header:', header);
      console.log('✅ JWT Payload:', payload);
      
      return {
        isValid: isValidJWT,
        header,
        payload,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null
      };
    } catch (error) {
      console.error('❌ Token decode failed:', error);
      return { isValid: false, error };
    }
  },

  /**
   * Check environment variables
   */
  checkEnvironment() {
    const env = {
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      currentURL: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.log('🔍 Environment check:', env);
    return env;
  },

  /**
   * Test localStorage functionality
   */
  testLocalStorage() {
    try {
      const testKey = 'auth_debug_test';
      const testValue = 'test_value';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      console.log('✅ localStorage working:', retrieved === testValue);
      return { working: retrieved === testValue };
    } catch (error) {
      console.error('❌ localStorage failed:', error);
      return { working: false, error };
    }
  }
};

// Global debug function for browser console
(window as any).debugAuth = debugAuth; 