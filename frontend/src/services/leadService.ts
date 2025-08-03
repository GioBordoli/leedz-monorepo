// Temporary fix: hardcode the correct API URL
const API_URL = 'http://localhost:3001/api';

export interface LeadData {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating?: number;
  reviewCount?: number;
  placeId: string;
}

export interface BusinessType {
  value: string;
  label: string;
}

export interface BusinessCategories {
  [category: string]: BusinessType[];
}

export interface SearchParams {
  businessType: string;
  location: string;
  maxResults?: number;
}

export interface SearchResult {
  success: boolean;
  results: LeadData[];
  search: {
    businessType: string;
    location: string;
    requested: number;
    found: number;
    timestamp: string;
  };
  usage: {
    todayCount: number;
    dailyLimit: number;
    remaining: number;
  };
}

export interface UsageStats {
  success: boolean;
  usage: {
    dailyCount: number;
    dailyLimit: number;
    remaining: number;
    resetDate: string;
    percentUsed: number;
  };
  apiKey: {
    configured: boolean;
    lastUpdated: string;
  };
}

class LeadService {
  /**
   * Get authorization headers for API requests
   */
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('Authorization header required - no token provided');
    }

    return headers;
  }

  /**
   * Start a lead generation search
   */
  async searchLeads(params: SearchParams, token?: string): Promise<SearchResult> {
    try {
      const response = await fetch(`${API_URL}/leads/search`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Search failed');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Lead search failed:', error);
      throw error;
    }
  }

  /**
   * Get current usage statistics
   */
  async getUsageStats(token?: string): Promise<UsageStats> {
    try {
      const response = await fetch(`${API_URL}/leads/usage`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to get usage stats');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get usage stats:', error);
      throw error;
    }
  }

  /**
   * Test user's Google Places API key
   */
  async testApiKey(token?: string): Promise<{ success: boolean; message: string; tested_at: string }> {
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
}

export default new LeadService(); 