import { 
  BillingStatusResponse, 
  PlansResponse, 
  UsageStatsResponse,
  EnhancedBillingStatus,
  PlanInfo,
  EnhancedUsageStats,
  // Legacy types for backward compatibility
  BillingStatus,
  CheckoutSession,
  PortalSession
} from '../types/billing';

// Stripe Payment Links (no Stripe SDK needed)
const STRIPE_PAYMENT_LINKS = {
  monthly: 'https://buy.stripe.com/cNi5kE84of4lb0Xc4Qdby00',
  yearly: 'https://buy.stripe.com/aFa3cwdoI09r5GD5Gsdby01'
};

class BillingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001'; // TODO: change to production URL
  }

  /**
   * Get user's current billing status (legacy format for backward compatibility)
   */
  async getBillingStatus(): Promise<BillingStatus> {
    const enhanced = await this.getEnhancedBillingStatus();
    
    // Convert enhanced format to legacy format
    return {
      hasSubscription: enhanced.subscription.isActive,
      subscriptionStatus: enhanced.subscription.status,
      subscriptionPlan: enhanced.subscription.plan,
      hasPaymentMethod: enhanced.flags.hasPaymentMethod
    };
  }

  /**
   * Get comprehensive billing status with enhanced tier information
   */
  async getEnhancedBillingStatus(): Promise<EnhancedBillingStatus> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/api/billing/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch billing status');
    }

    const result: BillingStatusResponse = await response.json();
    
    if (!result.success) {
      throw new Error('API returned error status');
    }

    return result.data;
  }

  /**
   * Get available plans and pricing information (public endpoint)
   */
  async getPlans(): Promise<PlanInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/billing/plans`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    const result: PlansResponse = await response.json();
    
    if (!result.success) {
      throw new Error('API returned error status');
    }

    return result.data.plans;
  }

  /**
   * Get enhanced usage statistics
   */
  async getUsageStats(): Promise<EnhancedUsageStats> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/api/leads/usage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch usage stats');
    }

    const result: UsageStatsResponse = await response.json();
    
    if (!result.success) {
      throw new Error('API returned error status');
    }

    return result.data;
  }

  /**
   * Redirect to Stripe Payment Link (Monthly)
   */
  async redirectToMonthlyCheckout(): Promise<void> {
    window.location.href = STRIPE_PAYMENT_LINKS.monthly;
  }

  /**
   * Redirect to Stripe Payment Link (Yearly)
   */
  async redirectToYearlyCheckout(): Promise<void> {
    window.location.href = STRIPE_PAYMENT_LINKS.yearly;
  }

  /**
   * Create a Stripe Customer Portal session
   */
  async createPortalSession(): Promise<PortalSession> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/api/billing/create-portal-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    return response.json();
  }

  /**
   * Redirect to Stripe Checkout (defaults to monthly)
   */
  async redirectToCheckout(plan: 'monthly' | 'yearly' = 'monthly'): Promise<void> {
    if (plan === 'yearly') {
      await this.redirectToYearlyCheckout();
    } else {
      await this.redirectToMonthlyCheckout();
    }
  }

  /**
   * Redirect to Stripe Customer Portal
   */
  async redirectToPortal(): Promise<void> {
    try {
      const { url } = await this.createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to portal:', error);
      throw error;
    }
  }
}

const billingService = new BillingService();
export default billingService; 