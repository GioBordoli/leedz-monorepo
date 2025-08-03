// Temporary fix: hardcode the correct API URL
const API_URL = 'http://localhost:3001/api';

export interface ApiKeyStatus {
  success: boolean;
  api_key_status: {
    has_key: boolean;
    key_preview: string | null;
    last_updated: string | null;
    is_valid: boolean;
  };
}

export interface ApiKeySaveResponse {
  success: boolean;
  message: string;
  key_preview: string;
  stored_at: string;
}

export interface ApiKeyTestResponse {
  success: boolean;
  message: string;
  tested_at: string;
}

class UserService {
  /**
   * Get authorization headers for API requests
   */
  private getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get API key status
   */
  async getApiKeyStatus(token: string): Promise<ApiKeyStatus> {
    try {
      const url = `${API_URL}/user/api-key/status`;
      const headers = this.getHeaders(token);
      
      // DEBUG: Log the exact request details
      console.log('🔍 USER SERVICE DEBUG - API Key Status Request:');
      console.log('   URL:', url);
      console.log('   API_URL constant:', API_URL);
      console.log('   Headers:', headers);
      console.log('   Token preview:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      // DEBUG: Log the response details
      console.log('🔍 USER SERVICE DEBUG - Response:');
      console.log('   Status:', response.status, response.statusText);
      console.log('   Headers:', Object.fromEntries(response.headers.entries()));
      console.log('   URL that was actually called:', response.url);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ USER SERVICE DEBUG - Error response body:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to get API key status');
      }

      const result = await response.json();
      console.log('✅ USER SERVICE DEBUG - Success response body:', result);
      return result;
    } catch (error) {
      console.error('❌ USER SERVICE: Failed to get API key status:', error);
      throw error;
    }
  }

  /**
   * Save/update API key
   */
  async saveApiKey(token: string, apiKey: string): Promise<ApiKeySaveResponse> {
    try {
      const response = await fetch(`${API_URL}/user/api-key`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ api_key: apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to save API key');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to save API key:', error);
      throw error;
    }
  }

  /**
   * Test API key validity
   */
  async testApiKey(token: string): Promise<ApiKeyTestResponse> {
    try {
      const response = await fetch(`${API_URL}/leads/test-api-key`, {
        method: 'POST',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'API key test failed');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API key test failed:', error);
      throw error;
    }
  }

  /**
   * Delete API key (by saving empty string)
   */
  async deleteApiKey(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // We don't have a delete endpoint, so we just save an empty key
      // The backend will handle this appropriately
      const response = await fetch(`${API_URL}/user/api-key`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ api_key: '' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to delete API key');
      }

      return {
        success: true,
        message: 'API key deleted successfully'
      };
    } catch (error) {
      console.error('❌ Failed to delete API key:', error);
      throw error;
    }
  }
}

export default new UserService(); 