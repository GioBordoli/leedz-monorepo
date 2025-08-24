import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

export interface BillingStatus {
  hasSubscription: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  subscriptionPlan: string;
  hasPaymentMethod: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PortalSession {
  url: string;
}

class BillingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  /**
   * Get user's current billing status
   */
  async getBillingStatus(): Promise<BillingStatus> {
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
      throw new Error('Failed to fetch billing status');
    }

    return response.json();
  }

  /**
   * Create a Stripe Checkout session
   */
  async createCheckoutSession(): Promise<CheckoutSession> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}/api/billing/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return response.json();
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
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(): Promise<void> {
    try {
      const { url } = await this.createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
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

  /**
   * Get Stripe instance
   */
  async getStripe() {
    return await stripePromise;
  }
}

const billingService = new BillingService();
export default billingService; 