import { Request, Response } from 'express';
import { UserModel, UpdateUserData } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    picture?: string;
  };
}

class UserController {
  /**
   * Get user profile
   * GET /api/user/profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // Don't expose encrypted API key in profile response
      const userProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        subscription_status: user.subscription_status,
        daily_usage_count: user.daily_usage_count,
        usage_reset_date: user.usage_reset_date,
        created_at: user.created_at,
        updated_at: user.updated_at,
        has_api_key: !!user.places_api_key // Boolean flag instead of actual key
      };

      res.json({
        success: true,
        user: userProfile
      });

    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { name, picture } = req.body;

      // TODO: Add input validation middleware for better security
      // FIXME: Implement rate limiting to prevent profile spam updates
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Name is required and must be a non-empty string' });
        return;
      }

      if (name.length > 255) {
        res.status(400).json({ error: 'Name cannot exceed 255 characters' });
        return;
      }

      if (picture && (typeof picture !== 'string' || picture.length > 500)) {
        res.status(400).json({ error: 'Picture URL must be a string under 500 characters' });
        return;
      }

      const updateData: UpdateUserData = {
        name: name.trim(),
        picture: picture?.trim() || undefined
      };

      const updatedUser = await UserModel.update(req.user.id, updateData);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Return updated profile (without sensitive data)
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          picture: updatedUser.picture,
          updated_at: updatedUser.updated_at
        }
      });

    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  }

  /**
   * Store/Update Google Places API key (encrypted)
   * POST /api/user/api-key
   */
  async setApiKey(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { api_key } = req.body;

      if (!api_key || typeof api_key !== 'string') {
        res.status(400).json({ 
          error: 'API key is required and must be a string',
          example: 'AIzaSyExample1234567890abcdefghijklmno'
        });
        return;
      }

      const trimmedKey = api_key.trim();

      // TODO: Add actual Google Places API validation call to verify key works
      // FIXME: Current validation is format-only, doesn't check if key is valid/active
      try {
        const updateData: UpdateUserData = {
          places_api_key: trimmedKey
        };

        const updatedUser = await UserModel.update(req.user.id, updateData);

        if (!updatedUser) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        res.json({
          success: true,
          message: 'API key stored successfully',
          key_preview: `${trimmedKey.substring(0, 10)}...${trimmedKey.substring(trimmedKey.length - 4)}`,
          stored_at: updatedUser.updated_at
        });

      } catch (validationError: any) {
        if (validationError.message.includes('Invalid Google Places API key format')) {
          res.status(400).json({ 
            error: 'Invalid Google Places API key format',
            details: 'API key should be 39 characters starting with "AIza"',
            example: 'AIzaSyExample1234567890abcdefghijklmno'
          });
          return;
        }
        throw validationError;
      }

    } catch (error) {
      console.error('❌ Error storing API key:', error);
      res.status(500).json({ error: 'Failed to store API key' });
    }
  }

  /**
   * Get daily usage statistics
   * GET /api/user/usage
   */
  async getUsageStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const usage = await UserModel.getDailyUsage(req.user.id);
      const hasReachedLimit = await UserModel.hasReachedDailyLimit(req.user.id);
      
      const remainingLeads = Math.max(0, 1000 - usage.count);
      const usagePercentage = Math.round((usage.count / 1000) * 100);

      res.json({
        success: true,
        usage: {
          daily_count: usage.count,
          daily_limit: 1000,
          remaining_leads: remainingLeads,
          usage_percentage: usagePercentage,
          reset_date: usage.resetDate,
          has_reached_limit: hasReachedLimit,
          next_reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
        }
      });

    } catch (error) {
      console.error('❌ Error getting usage stats:', error);
      res.status(500).json({ error: 'Failed to get usage statistics' });
    }
  }

  /**
   * Delete user account (GDPR compliance)
   * DELETE /api/user/account
   */
  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // TODO: Add confirmation step and email verification for account deletion
      // FIXME: Implement proper cleanup of related data (sheets configs, billing)
      const { confirmation } = req.body;

      if (!confirmation || confirmation !== 'DELETE_MY_ACCOUNT') {
        res.status(400).json({ 
          error: 'Account deletion requires confirmation',
          required_confirmation: 'DELETE_MY_ACCOUNT'
        });
        return;
      }

      const deleted = await UserModel.delete(req.user.id);

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      console.error('❌ Error deleting user account:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }

  /**
   * Get API key status (without exposing the actual key)
   * GET /api/user/api-key/status
   */
  async getApiKeyStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const hasApiKey = !!user.places_api_key;
      let keyPreview = null;

      if (hasApiKey && user.places_api_key) {
        // Show only first 10 and last 4 characters for security
        const decryptedKey = await UserModel.getApiKey(req.user.id);
        if (decryptedKey) {
          keyPreview = `${decryptedKey.substring(0, 10)}...${decryptedKey.substring(decryptedKey.length - 4)}`;
        }
      }

      res.json({
        success: true,
        api_key_status: {
          has_key: hasApiKey,
          key_preview: keyPreview,
          last_updated: user.updated_at
        }
      });

    } catch (error) {
      console.error('❌ Error getting API key status:', error);
      res.status(500).json({ error: 'Failed to get API key status' });
    }
  }
}

export default UserController; 