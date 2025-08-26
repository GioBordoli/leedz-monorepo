// Temporary fix: hardcode the correct API URL
const API_URL = 'http://localhost:3001/api';

export interface LeadData {
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
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
    monthlyCount: number;
    monthlyLimit: number;
    remaining: number;
  };
}

export interface StreamingCallbacks {
  onBusinessFound?: (businessName: string, found: number, total: number) => void;
  onComplete?: (result: SearchResult) => void;
  onError?: (error: string) => void;
  onStart?: (businessType: string, location: string) => void;
}

export interface UsageStats {
  success: boolean;
  usage: {
    monthlyCount: number;
    monthlyLimit: number;
    remaining: number;
    resetMonth: string;
    percentUsed: number;
  };
  apiKey: {
    configured: boolean;
    lastUpdated: string;
  };
}

export interface SheetInfo {
  id: string;
  name: string;
  url: string;
}

export interface WorksheetInfo {
  id: number;
  name: string;
}

export interface ExportOptions {
  sheetId?: string;
  sheetName?: string;
  worksheetName?: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  sheetUrl: string;
  exportedCount: number;
  timestamp: string;
}

export interface SheetsAuthStatus {
  success: boolean;
  authenticated: boolean;
  hasRefreshToken: boolean;
  needsReauth: boolean;
  message: string;
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
   * Start a streaming lead generation search with real-time business name updates
   */
  async searchLeadsStream(
    params: SearchParams, 
    callbacks: StreamingCallbacks,
    token?: string
  ): Promise<void> {
    if (!token) {
      throw new Error('Authorization token required');
    }

    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/leads/search-stream`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(params),
      }).then(async response => {
        if (!response.ok) {
          try {
            const errorData = await response.json();
            const message = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(message);
          } catch (_) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body reader available');
        }

        let buffer = '';

        const emitEvent = (rawEvent: string) => {
          // Parse SSE frame: split lines, collect data lines
          const lines = rawEvent.split('\n');
          const dataLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trimStart());
            }
          }
          if (dataLines.length === 0) return;
          const dataStr = dataLines.join('\n');
          try {
            const data = JSON.parse(dataStr);
            switch (data.type) {
              case 'start':
                callbacks.onStart?.(data.businessType, data.location);
                break;
              case 'business_found':
                callbacks.onBusinessFound?.(data.name, data.found, data.total);
                break;
              case 'complete': {
                const result: SearchResult = {
                  success: true,
                  results: data.results,
                  search: data.search,
                  usage: data.usage
                };
                callbacks.onComplete?.(result);
                resolve();
                break;
              }
              case 'error':
                callbacks.onError?.(data.message);
                reject(new Error(data.message));
                break;
            }
          } catch (e) {
            // swallow parse errors for partial frames
          }
        };

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                // flush any trailing complete frame if present
                const frames = buffer.split('\n\n');
                for (let i = 0; i < frames.length - 1; i++) {
                  emitEvent(frames[i]);
                }
                resolve();
                break;
              }

              buffer += decoder.decode(value, { stream: true });

              // process complete SSE events delimited by blank line
              let sepIndex: number;
              while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
                const rawEvent = buffer.slice(0, sepIndex);
                emitEvent(rawEvent);
                buffer = buffer.slice(sepIndex + 2); // Only discard consumed portion; keep remainder
              }
            }
          } catch (error) {
            callbacks.onError?.(error instanceof Error ? error.message : 'Stream processing failed');
            reject(error);
          }
        };

        processStream();
      }).catch(error => {
        callbacks.onError?.(error.message || 'Failed to start streaming search');
        reject(error);
      });
    });
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
   * Get current usage statistics (legacy format for backward compatibility)
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

      const result = await response.json();
      
      console.log('🔍 Raw API response for usage stats:', result);
      
      // Convert new enhanced format to legacy format for backward compatibility
      if (result.success && result.data) {
        const { data } = result;
        const legacyFormat = {
          success: true,
          usage: {
            monthlyCount: data.usage?.current || 0,
            monthlyLimit: data.usage?.limit || 10000,
            remaining: typeof data.usage?.remaining === 'number' ? data.usage.remaining : 0,
            resetMonth: data.period?.resetDate || new Date().toISOString(),
            percentUsed: data.usage?.percentage || 0
          },
          apiKey: {
            configured: data.apiKey?.configured || false,
            lastUpdated: data.apiKey?.lastUpdated || new Date().toISOString()
          }
        };
        console.log('✅ Converted to legacy format:', legacyFormat);
        return legacyFormat as unknown as UsageStats;
      }
      
      console.log('⚠️ Using raw response (not new format):', result);
      return result as UsageStats;
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

  /**
   * Check Google Sheets authentication status
   */
  async checkSheetsAuthStatus(token?: string): Promise<SheetsAuthStatus> {
    try {
      const response = await fetch(`${API_URL}/leads/sheets/auth-status`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to check authentication status');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to check Sheets auth status:', error);
      throw error;
    }
  }

  /**
   * Export leads to Google Sheets
   */
  async exportToSheets(
    leads: LeadData[], 
    options: ExportOptions, 
    businessType: string, 
    location: string, 
    token?: string
  ): Promise<ExportResult> {
    try {
      const response = await fetch(`${API_URL}/leads/export-to-sheets`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({
          leads,
          ...options,
          businessType,
          location
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Export failed');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Export to sheets failed:', error);
      throw error;
    }
  }

  /**
   * Get user's Google Sheets
   */
  async getSheets(token?: string): Promise<{ success: boolean; sheets: SheetInfo[] }> {
    try {
      const response = await fetch(`${API_URL}/leads/sheets`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific authentication errors
        if (response.status === 403 && errorData.needsReauth) {
          throw new Error('REAUTH_REQUIRED:' + (errorData.message || 'Re-authentication required'));
        }
        
        if (response.status === 401 && errorData.needsReauth) {
          throw new Error('REAUTH_REQUIRED:' + (errorData.message || 'Authentication expired'));
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to get sheets');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get sheets failed:', error);
      throw error;
    }
  }

  /**
   * Validate a specific spreadsheet
   */
  async validateSpreadsheet(spreadsheetId: string, token?: string): Promise<{ success: boolean; sheet: SheetInfo }> {
    try {
      const response = await fetch(`${API_URL}/leads/sheets/validate`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ spreadsheetId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to validate spreadsheet');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Validate spreadsheet failed:', error);
      throw error;
    }
  }

  /**
   * Get worksheets for a specific sheet
   */
  async getWorksheets(sheetId: string, token?: string): Promise<{ success: boolean; worksheets: WorksheetInfo[] }> {
    try {
      const response = await fetch(`${API_URL}/leads/sheets/${sheetId}/worksheets`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to get worksheets');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get worksheets:', error);
      throw error;
    }
  }
}

const leadService = new LeadService();
export { leadService };
export default leadService; 