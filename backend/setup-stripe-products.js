#!/usr/bin/env node

/**
 * Stripe Product Setup Script for Leedz
 * Run this once to create products and prices in your Stripe account
 * 
 * Usage: node setup-stripe-products.js
 */

require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products for Leedz...');

    // Create product
    const product = await stripe.products.create({
      name: 'Leedz Pro Subscription',
      description: 'Monthly subscription to access Leedz lead generation platform with 10,000 API calls per month',
      images: ['https://leedz.io/logo.png'], // Update with your actual logo URL
      metadata: {
        type: 'subscription',
        features: 'Lead generation, Google Sheets integration, 10k monthly API calls'
      }
    });

    console.log('✅ Product created:', product.id);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 2900, // $29.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        usage_type: 'licensed',
      },
      nickname: 'Monthly Pro Plan',
      metadata: {
        plan_type: 'pro',
        api_calls_limit: '10000'
      }
    });

    console.log('✅ Monthly price created:', monthlyPrice.id);

    // Create yearly price (optional, with discount)
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 29000, // $290.00 in cents (10 months pricing for 12 months)
      currency: 'usd',
      recurring: {
        interval: 'year',
        usage_type: 'licensed',
      },
      nickname: 'Yearly Pro Plan (2 months free)',
      metadata: {
        plan_type: 'pro',
        api_calls_limit: '10000',
        discount: '2_months_free'
      }
    });

    console.log('✅ Yearly price created:', yearlyPrice.id);

    console.log('\n🎉 Stripe setup complete!');
    console.log('\n📝 Add these to your .env file:');
    console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`);
    console.log(`STRIPE_PRODUCT_ID=${product.id}`);

    console.log('\n⚙️ Next steps:');
    console.log('1. Update your .env file with the price IDs above');
    console.log('2. Set up a webhook endpoint in Stripe Dashboard pointing to: https://yourdomain.com/api/billing/webhook');
    console.log('3. Add webhook events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.paid, invoice.payment_failed');
    console.log('4. Add the webhook signing secret to STRIPE_WEBHOOK_SECRET in your .env');

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupStripeProducts();
}

module.exports = { setupStripeProducts }; 