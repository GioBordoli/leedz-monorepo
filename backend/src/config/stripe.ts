import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with your secret key (only if key is provided)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;

if (stripeSecretKey && stripeSecretKey.length > 0 && !stripeSecretKey.includes('placeholder')) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-07-30.basil', // Latest API version
  });
  console.log('✅ Stripe SDK initialized successfully');
} else {
  console.warn('⚠️  Stripe not initialized - STRIPE_SECRET_KEY not configured');
}

// Stripe configuration
export const stripeConfig = {
  // Product and pricing configuration
  products: {
    subscription: {
      name: 'Leedz Pro Subscription',
      description: 'Monthly subscription to Leedz lead generation platform',
    }
  },
  
  // Pricing configuration (you'll create these in Stripe Dashboard or via API)
  prices: {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
    // You can add yearly pricing later: yearly: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder',
  },

  // Webhooks
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Return URLs for checkout
  urls: {
    success: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}` : 'http://localhost:3000/billing/success?session_id={CHECKOUT_SESSION_ID}',
    cancel: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/billing/cancel` : 'http://localhost:3000/billing/cancel',
    customerPortalReturn: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/settings` : 'http://localhost:3000/settings',
  }
};

// Helper function to get Stripe instance (throws error if not configured)
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
  }
  return stripe;
}

// Helper function to check if Stripe is available
export function isStripeConfigured(): boolean {
  return stripe !== null;
}

export default stripe; 