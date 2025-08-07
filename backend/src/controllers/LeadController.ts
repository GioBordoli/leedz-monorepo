import { Request, Response } from 'express';
import PlacesService, { SearchParams, SearchProgress } from '../services/PlacesService';
import { UserModel } from '../models/User';
import { SheetsService, Lead, ExportOptions, ExportResult } from '../services/SheetsService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    picture?: string;
    googleId: string;
    hasCompletedOnboarding: boolean;
    isFirstLogin: boolean;
    needsOnboarding: boolean;
  };
}

/**
 * Lead Generation Controller
 * Handles lead search orchestration, usage tracking, and search management
 * Replaces CLI scraper functionality with web-based search endpoints
 */
class LeadController {
  /**
   * Start a streaming lead generation search with business names appearing one-by-one
   * POST /api/leads/search-stream
   */
  async streamSearch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { businessType, location } = req.body;

      // Validate required fields
      if (!businessType || !location) {
        res.status(400).json({ 
          error: 'Business type and location are required',
          example: {
            businessType: 'restaurant',
            location: 'San Francisco, CA'
          }
        });
        return;
      }

      // Get user and check usage limits
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check subscription status
      if (user.subscription_status !== 'active') {
        res.status(403).json({ 
          error: 'Subscription required',
          message: 'An active subscription is required to search for leads',
          subscriptionStatus: user.subscription_status
        });
        return;
      }

      // Check if user has API key
      if (!user.places_api_key) {
        res.status(400).json({ 
          error: 'Google Places API key required',
          message: 'Please add your Google Places API key in Settings before searching for leads'
        });
        return;
      }

      // Check monthly usage limits (10,000 per month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const userResetMonth = user.usage_reset_month?.toISOString().slice(0, 7);
      
      if (userResetMonth !== currentMonth) {
        // Reset monthly count for new month
        await UserModel.update(user.id, {
          monthly_usage_count: 0,
          usage_reset_month: new Date()
        });
        user.monthly_usage_count = 0;
      }

      // Check if user has basic remaining capacity (grid search will use more leads)
      const estimatedLeads = 300; // Conservative estimate for grid search
      if (user.monthly_usage_count + estimatedLeads > 10000) {
        res.status(429).json({ 
          error: 'Monthly usage limit exceeded',
          message: `You have ${10000 - user.monthly_usage_count} searches remaining this month`,
          monthlyLimit: 10000,
          currentUsage: user.monthly_usage_count
        });
        return;
      }

      // Set up Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // Decrypt and use user's API key
      const decryptedApiKey = await UserModel.getDecryptedApiKey(user.id);
      if (!decryptedApiKey) {
        res.write(`data: ${JSON.stringify({type: 'error', message: 'Failed to retrieve API key'})}\n\n`);
        res.end();
        return;
      }

      // Initialize Places service with user's API key
      const placesService = new PlacesService(decryptedApiKey);

      console.log(`🚀 Starting streaming search for user ${user.email}: ${businessType} in ${location}`);

      // Send initial status
      res.write(`data: ${JSON.stringify({type: 'start', message: 'Starting search...', businessType, location})}\n\n`);

      // Perform the search with streaming progress
      const searchParams: SearchParams = {
        businessType,
        location,
        radius: 10000 // 10km radius - reasonable for most searches
      };

      const results = await placesService.searchBusinessesGrid(searchParams, (progress: SearchProgress) => {
        // Stream business names as they're found
        if (progress.currentLocation && !progress.isComplete) {
          res.write(`data: ${JSON.stringify({
            type: 'business_found', 
            name: progress.currentLocation,
            found: progress.found,
            total: progress.total
          })}\n\n`);
        }
      }, user.id); // Pass userId for duplicate prevention

      // Update user's daily usage count
      await UserModel.update(user.id, {
        monthly_usage_count: user.monthly_usage_count + results.length
      });

      console.log(`✅ Streaming search completed for ${user.email}: ${results.length} leads found`);

      // Send final results
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        results,
        search: {
          businessType,
          location,
          requested: results.length, // We get all available leads with grid search
          found: results.length,
          timestamp: new Date().toISOString()
        },
        usage: {
          todayCount: user.monthly_usage_count + results.length,
          dailyLimit: 10000,
          remaining: 10000 - (user.monthly_usage_count + results.length)
        }
      })}\n\n`);

      res.end();

    } catch (error) {
      console.error('❌ Streaming search failed:', error);
      
      // Send error via SSE
      let errorMessage = 'Search failed';
      if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
          errorMessage = 'Invalid Google Places API key';
        } else if (error.message.includes('Location not found')) {
          errorMessage = 'Location not found';
        } else {
          errorMessage = error.message;
        }
      }

      res.write(`data: ${JSON.stringify({type: 'error', message: errorMessage})}\n\n`);
      res.end();
    }
  }

  /**
   * Start a lead generation search
   * POST /api/leads/search
   */
  async startSearch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { businessType, location, maxResults = 25 } = req.body;

      // Validate required fields
      if (!businessType || !location) {
        res.status(400).json({ 
          error: 'Business type and location are required',
          example: {
            businessType: 'restaurant',
            location: 'San Francisco, CA',
            maxResults: 25
          }
        });
        return;
      }

      // Validate maxResults range (1-250)
      const requestedResults = Math.max(1, Math.min(250, parseInt(maxResults.toString()) || 25));
      if (maxResults < 1 || maxResults > 250) {
        res.status(400).json({ 
          error: 'Invalid lead count',
          message: 'Number of leads must be between 1 and 250',
          provided: maxResults,
          validRange: { min: 1, max: 250 }
        });
        return;
      }

      // Get user and check usage limits
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check subscription status
      if (user.subscription_status !== 'active') {
        res.status(403).json({ 
          error: 'Subscription required',
          message: 'An active subscription is required to search for leads',
          subscriptionStatus: user.subscription_status
        });
        return;
      }

      // Check if user has API key
      if (!user.places_api_key) {
        res.status(400).json({ 
          error: 'Google Places API key required',
          message: 'Please add your Google Places API key in Settings before searching for leads'
        });
        return;
      }

      // Check monthly usage limits (10,000 per month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const userResetMonth = user.usage_reset_month?.toISOString().slice(0, 7);
      
      if (userResetMonth !== currentMonth) {
        // Reset monthly count for new month
        await UserModel.update(user.id, {
          monthly_usage_count: 0,
          usage_reset_month: new Date()
        });
        user.monthly_usage_count = 0;
      }

      // Check if user has exceeded monthly limit
      if (user.monthly_usage_count + requestedResults > 10000) {
        res.status(429).json({ 
          error: 'Monthly usage limit exceeded',
          message: `You have ${10000 - user.monthly_usage_count} searches remaining this month`,
          monthlyLimit: 10000,
          currentUsage: user.monthly_usage_count
        });
        return;
      }

      // Decrypt and use user's API key
      const decryptedApiKey = await UserModel.getDecryptedApiKey(user.id);
      if (!decryptedApiKey) {
        res.status(500).json({ error: 'Failed to retrieve API key' });
        return;
      }

      // Initialize Places service with user's API key
      const placesService = new PlacesService(decryptedApiKey);

      console.log(`🚀 Starting lead search for user ${user.email}: ${businessType} in ${location}`);

      // Perform the search
      const searchParams: SearchParams = {
        businessType,
        location,
        maxResults: requestedResults,
        radius: 10000 // 10km radius - reasonable for most searches
      };

      const results = await placesService.searchBusinesses(searchParams, (progress: SearchProgress) => {
        // TODO: In future milestone, send progress via WebSocket
        console.log(`📊 Search progress: ${progress.found}/${progress.total} - ${progress.currentLocation || 'Searching...'}`);
      }, user.id); // Pass userId for duplicate prevention

      // Update user's daily usage count
      await UserModel.update(user.id, {
        monthly_usage_count: user.monthly_usage_count + results.length
      });

      console.log(`✅ Search completed for ${user.email}: ${results.length} leads found`);

      // Return results
      res.json({
        success: true,
        results,
        search: {
          businessType,
          location,
          requested: requestedResults,
          found: results.length,
          timestamp: new Date().toISOString()
        },
        usage: {
          todayCount: user.monthly_usage_count + results.length,
          dailyLimit: 10000,
          remaining: 10000 - (user.monthly_usage_count + results.length)
        }
      });

    } catch (error) {
      console.error('❌ Lead search failed:', error);
      
      // Handle specific Google API errors
      if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
          res.status(400).json({ 
            error: 'Invalid Google Places API key',
            message: 'Please check your API key in Settings and ensure it has Places API access enabled'
          });
          return;
        }
        
        if (error.message.includes('Location not found')) {
          res.status(400).json({ 
            error: 'Location not found',
            message: 'Please enter a valid city name, address, or ZIP code'
          });
          return;
        }
      }

      res.status(500).json({ 
        error: 'Search failed',
        message: 'An error occurred while searching for leads. Please try again.'
      });
    }
  }

  /**
   * Get user's current usage statistics
   * GET /api/leads/usage
   */
  async getUsageStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if usage count needs reset for new month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const userResetMonth = user.usage_reset_month?.toISOString().slice(0, 7);
      
      let currentUsage = user.monthly_usage_count || 0;
      let resetMonth = user.usage_reset_month;
      
      if (userResetMonth !== currentMonth) {
        currentUsage = 0;
        resetMonth = new Date(); // Current month start
      }

      res.json({
        success: true,
        usage: {
          monthlyCount: currentUsage,
          monthlyLimit: 10000,
          remaining: 10000 - currentUsage,
          resetMonth: resetMonth,
          percentUsed: Math.round((currentUsage / 10000) * 100)
        },
        apiKey: {
          configured: !!user.places_api_key,
          lastUpdated: user.updated_at
        }
      });
    } catch (error) {
      console.error('❌ Failed to get usage stats:', error);
      res.status(500).json({ error: 'Failed to get usage statistics' });
    }
  }

  /**
   * Test user's Google Places API key
   * POST /api/leads/test-api-key
   */
  async testApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user || !user.places_api_key) {
        res.status(400).json({ 
          error: 'No API key found',
          message: 'Please add your Google Places API key first'
        });
        return;
      }

      // Decrypt and test the API key
      const decryptedApiKey = await UserModel.getDecryptedApiKey(user.id);
      if (!decryptedApiKey) {
        res.status(500).json({ error: 'Failed to retrieve API key' });
        return;
      }

      const placesService = new PlacesService(decryptedApiKey);
      const isValid = await placesService.validateApiKey();

      if (isValid) {
        res.json({
          success: true,
          message: 'API key is valid and working',
          tested_at: new Date().toISOString()
        });
      } else {
        res.status(400).json({
          error: 'Invalid API key',
          message: 'Your Google Places API key is not valid or does not have the required permissions',
          help: 'Ensure your API key has Places API access enabled in Google Cloud Console'
        });
      }
    } catch (error) {
      console.error('❌ API key test failed:', error);
      res.status(500).json({ error: 'Failed to test API key' });
    }
  }

  /**
   * Export leads to Google Sheets
   * POST /api/leads/export-to-sheets
   */
  async exportToSheets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { leads, sheetId, sheetName, worksheetName, businessType, location } = req.body;

      // Validate required fields
      if (!leads || !Array.isArray(leads) || leads.length === 0) {
        res.status(400).json({ 
          error: 'Leads data is required',
          message: 'Please provide an array of leads to export'
        });
        return;
      }

      // Validate lead structure
      const isValidLead = (lead: any): lead is Lead => {
        return typeof lead === 'object' && 
               typeof lead.name === 'string' &&
               typeof lead.address === 'string' &&
               (lead.phone === null || typeof lead.phone === 'string') &&
               (lead.website === null || typeof lead.website === 'string');
      };

      if (!leads.every(isValidLead)) {
        res.status(400).json({ 
          error: 'Invalid lead data format',
          message: 'Each lead must have name, address, phone, and website fields'
        });
        return;
      }

      // Get user to access OAuth token
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if user has Google OAuth token
      if (!user.google_access_token) {
        res.status(400).json({ 
          error: 'Google authentication required',
          message: 'Please re-authenticate with Google to export to Sheets'
        });
        return;
      }

      // Initialize Sheets service with user's access token
      const sheetsService = new SheetsService(user.google_access_token);

      // Prepare export options
      const exportOptions: ExportOptions = {
        sheetId,
        sheetName: sheetName || (businessType && location ? 
          SheetsService.generateDefaultSheetName(businessType, location) : 
          'Leads Export'),
        worksheetName
      };

      console.log(`📊 Exporting ${leads.length} leads to Google Sheets for user ${user.email}`);

      // Export leads to Google Sheets
      const result: ExportResult = await sheetsService.exportLeads(leads, exportOptions);

      if (result.success) {
        console.log(`✅ Successfully exported ${leads.length} leads to Google Sheets for ${user.email}`);
        
        res.json({
          success: true,
          message: result.message,
          sheetUrl: result.sheetUrl,
          exportedCount: leads.length,
          timestamp: new Date().toISOString()
        });
      } else {
        console.error(`❌ Failed to export leads for ${user.email}:`, result.error);
        
        res.status(500).json({
          error: 'Export failed',
          message: result.message,
          details: result.error
        });
      }

    } catch (error) {
      console.error('❌ Lead export failed:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message.includes('access token')) {
          res.status(401).json({ 
            error: 'Google authentication expired',
            message: 'Please re-authenticate with Google to export to Sheets'
          });
          return;
        }
        
        if (error.message.includes('permission')) {
          res.status(403).json({ 
            error: 'Insufficient permissions',
            message: 'Please ensure you have granted access to Google Sheets'
          });
          return;
        }
      }

      res.status(500).json({ 
        error: 'Export failed',
        message: 'An error occurred while exporting leads. Please try again.'
      });
    }
  }

  /**
   * Check Google Sheets authentication status
   * GET /api/leads/sheets/auth-status
   */
  async checkSheetsAuthStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const hasValidToken = !!(user.google_access_token);
      const hasRefreshToken = !!(user.google_refresh_token);

      // TODO: Add actual token validation by making a test API call
      // For now, we just check if tokens exist
      res.json({
        success: true,
        authenticated: hasValidToken,
        hasRefreshToken,
        needsReauth: !hasValidToken,
        message: hasValidToken 
          ? 'Google Sheets authentication is active' 
          : 'Google Sheets authentication required'
      });

    } catch (error) {
      console.error('❌ Failed to check Sheets auth status:', error);
      res.status(500).json({ 
        error: 'Failed to check authentication status',
        message: 'Unable to verify Google Sheets connection'
      });
    }
  }

  /**
   * Get user's Google Sheets
   * GET /api/leads/sheets
   */
  async getSheets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (!user.google_access_token) {
        res.status(400).json({ 
          error: 'Google authentication required',
          message: 'Please authenticate with Google to access your sheets',
          needsReauth: true
        });
        return;
      }

      const sheetsService = new SheetsService(user.google_access_token);
      const sheets = await sheetsService.listSpreadsheets();

      res.json({
        success: true,
        sheets
      });

    } catch (error) {
      console.error('❌ Failed to get user sheets:', error);
      
      // Handle specific Google API errors
      if (error instanceof Error) {
        if (error.message.includes('insufficient authentication scopes')) {
          res.status(403).json({ 
            error: 'Insufficient permissions',
            message: 'Please re-authenticate to grant access to your Google Sheets',
            needsReauth: true
          });
          return;
        }
        
        if (error.message.includes('invalid_grant') || error.message.includes('Token has been expired')) {
          res.status(401).json({ 
            error: 'Authentication expired',
            message: 'Your Google authentication has expired. Please sign in again.',
            needsReauth: true
          });
          return;
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to retrieve sheets',
        message: 'Unable to access your Google Sheets. Please try again or re-authenticate.'
      });
    }
  }

  /**
   * Validate a specific spreadsheet by ID or URL
   * POST /api/leads/sheets/validate
   */
  async validateSpreadsheet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { spreadsheetId, spreadsheetUrl } = req.body;
      
      if (!spreadsheetId && !spreadsheetUrl) {
        res.status(400).json({ 
          error: 'Missing spreadsheet ID or URL' 
        });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user || !user.google_access_token) {
        res.status(400).json({ 
          error: 'Google authentication required',
          needsReauth: true
        });
        return;
      }

      // Extract spreadsheet ID from URL if provided
      let sheetId = spreadsheetId;
      if (spreadsheetUrl && !sheetId) {
        const match = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          sheetId = match[1];
        } else {
          res.status(400).json({ 
            error: 'Invalid Google Sheets URL format' 
          });
          return;
        }
      }

      const sheetsService = new SheetsService(user.google_access_token);
      const sheetInfo = await sheetsService.validateSpreadsheet(sheetId);

      if (sheetInfo) {
        res.json({
          success: true,
          sheet: sheetInfo
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Spreadsheet not found or access denied'
        });
      }

    } catch (error) {
      console.error('❌ Failed to validate spreadsheet:', error);
      res.status(500).json({ error: 'Failed to validate spreadsheet' });
    }
  }

  /**
   * Get worksheets for a specific sheet
   * GET /api/leads/sheets/:sheetId/worksheets
   */
  async getWorksheets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { sheetId } = req.params;
      if (!sheetId) {
        res.status(400).json({ error: 'Sheet ID is required' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (!user.google_access_token) {
        res.status(400).json({ 
          error: 'Google authentication required',
          message: 'Please authenticate with Google to access your sheets'
        });
        return;
      }

      const sheetsService = new SheetsService(user.google_access_token);
      const worksheets = await sheetsService.getWorksheets(sheetId);

      res.json({
        success: true,
        worksheets
      });

    } catch (error) {
      console.error('❌ Failed to get worksheets:', error);
      res.status(500).json({ error: 'Failed to retrieve worksheets' });
    }
  }

  /**
   * Clean up expired search cache entries
   * POST /api/leads/cleanup-cache
   */
  async cleanupCache(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Create a temporary PlacesService instance for cleanup
      const placesService = new PlacesService('dummy-key');
      const deletedCount = await placesService.cleanupExpiredCache();

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} expired cache entries`,
        deletedCount
      });

    } catch (error) {
      console.error('❌ Failed to cleanup cache:', error);
      res.status(500).json({ error: 'Failed to cleanup cache' });
    }
  }
}

export default LeadController; 