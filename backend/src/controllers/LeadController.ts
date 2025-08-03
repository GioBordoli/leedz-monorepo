import { Request, Response } from 'express';
import PlacesService, { SearchParams, SearchProgress } from '../services/PlacesService';
import { UserModel } from '../models/User';

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

      // Get user and check usage limits
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
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

      // Check daily usage limits (1000 per day)
      const today = new Date().toISOString().split('T')[0];
      const userResetDate = user.usage_reset_date?.toISOString().split('T')[0];
      
      if (userResetDate !== today) {
        // Reset daily count for new day
        await UserModel.update(user.id, {
          daily_usage_count: 0,
          usage_reset_date: new Date()
        });
        user.daily_usage_count = 0;
      }

      // Check if user has exceeded daily limit
      const requestedResults = Math.min(maxResults, 50); // Cap at 50 per search
      if (user.daily_usage_count + requestedResults > 1000) {
        res.status(429).json({ 
          error: 'Daily usage limit exceeded',
          message: `You have ${1000 - user.daily_usage_count} searches remaining today`,
          dailyLimit: 1000,
          currentUsage: user.daily_usage_count
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
      });

      // Update user's daily usage count
      await UserModel.update(user.id, {
        daily_usage_count: user.daily_usage_count + results.length
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
          todayCount: user.daily_usage_count + results.length,
          dailyLimit: 1000,
          remaining: 1000 - (user.daily_usage_count + results.length)
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

      // Check if usage count needs reset for new day
      const today = new Date().toISOString().split('T')[0];
      const userResetDate = user.usage_reset_date?.toISOString().split('T')[0];
      
      let currentUsage = user.daily_usage_count;
      if (userResetDate !== today) {
        currentUsage = 0;
      }

      res.json({
        success: true,
        usage: {
          dailyCount: currentUsage,
          dailyLimit: 1000,
          remaining: 1000 - currentUsage,
          resetDate: user.usage_reset_date,
          percentUsed: Math.round((currentUsage / 1000) * 100)
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
}

export default LeadController; 