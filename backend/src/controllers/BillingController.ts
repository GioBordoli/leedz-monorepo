import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';

class BillingController {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️ STRIPE_SECRET_KEY is not set. Billing functionality will be disabled.');
    } else {
      // Stripe initialization - will be used in future payment endpoints
      console.log('✅ Stripe SDK initialized successfully');
    }
  }

  /**
   * Get comprehensive billing and tier information for the user
   * Enhanced API following REST best practices with detailed tier data
   */
  async getBillingStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
        return;
      }

    try {
      const userId = parseInt(req.user.id);
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Get dynamic tier information
      const tier = await UserModel.getUserTier(userId);
      const monthlyLimit = await UserModel.getMonthlyLimitForUser(userId);
      const isFreeTier = tier === 'free';
      
      // Calculate usage statistics
      const currentUsage = user.monthly_usage_count || 0;
      const remainingLeads = isFreeTier ? Math.max(0, monthlyLimit - currentUsage) : null;
      const usagePercentage = isFreeTier ? Math.round((currentUsage / monthlyLimit) * 100) : 0;
      
      // Determine if user is approaching limits
      const approachingLimit = isFreeTier && usagePercentage >= 80;
      const nearLimit = isFreeTier && usagePercentage >= 95;

      // Enhanced billing status response
      const billingStatus = {
        // Core subscription data
        subscription: {
          status: user.subscription_status || 'inactive',
          isActive: user.subscription_status === 'active',
          tier: tier,
          plan: isFreeTier ? 'Free' : 'Pro',
          stripeCustomerId: user.stripe_customer_id || null,
          stripeSubscriptionId: user.stripe_subscription_id || null
        },

        // Usage information
        usage: {
          current: currentUsage,
          limit: isFreeTier ? monthlyLimit : null,
          remaining: remainingLeads,
          percentage: usagePercentage,
          resetDate: user.usage_reset_month,
          isUnlimited: !isFreeTier
        },

        // Features and capabilities
        features: {
          monthlyLeads: isFreeTier ? monthlyLimit : 'unlimited',
          exportFormats: ['CSV', 'Google Sheets'],
          supportLevel: isFreeTier ? 'Community' : 'Priority',
          apiAccess: true,
          customIntegrations: !isFreeTier
        },

        // Status flags for UI logic
        flags: {
          canUpgrade: isFreeTier,
          needsUpgrade: false, // Will be true when limit exceeded
          approachingLimit: approachingLimit,
          nearLimit: nearLimit,
          hasPaymentMethod: !!user.stripe_customer_id
        },

        // Action URLs (to be implemented in Phase 4)
        actions: {
          upgradeUrl: isFreeTier ? '/api/billing/checkout' : null,
          manageUrl: user.stripe_customer_id ? '/api/billing/portal' : null,
          pricingUrl: '/pricing'
        }
      };

      res.json({
        success: true,
        data: billingStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error fetching billing status:', error);
        res.status(500).json({ 
        success: false,
        error: 'Failed to fetch billing status',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get plan comparison and pricing information
   * Provides data for upgrade/downgrade decisions
   */
  async getPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // For public endpoint with optional auth, default to free tier if no user
      const currentTier = req.user?.id ? await UserModel.getUserTier(parseInt(req.user.id)) : 'free';
      
      const plans = {
        free: {
          id: 'free',
          name: 'Free',
          price: 0,
          currency: 'USD',
          interval: 'month',
          features: {
            monthlyLeads: 1000,
            exportFormats: ['CSV', 'Google Sheets'],
            supportLevel: 'Community',
            apiAccess: true,
            customIntegrations: false,
            prioritySupport: false,
            advancedFilters: false
          },
          limits: {
            leads: 1000,
            exports: 'unlimited',
            searches: 'unlimited'
          },
          popular: false,
          current: currentTier === 'free'
        },
        pro: {
          id: 'pro',
          name: 'Pro',
          price: 29,
          currency: 'USD',
          interval: 'month',
          features: {
            monthlyLeads: 'unlimited',
            exportFormats: ['CSV', 'Google Sheets', 'Excel'],
            supportLevel: 'Priority',
            apiAccess: true,
            customIntegrations: true,
            prioritySupport: true,
            advancedFilters: true
          },
          limits: {
            leads: 'unlimited',
            exports: 'unlimited',
            searches: 'unlimited'
          },
          popular: true,
          current: currentTier === 'pro',
          stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID || 'prod_pro_placeholder'
        }
      };

      res.json({
        success: true,
        data: {
          plans: [plans.free, plans.pro],
          currentPlan: currentTier,
          currency: 'USD'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch plans',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default BillingController; 