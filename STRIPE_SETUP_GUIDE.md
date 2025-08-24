# 💳 Stripe Integration Setup Guide

This guide walks you through setting up Stripe billing for the Leedz application.

## 🚀 Quick Start

### 1. Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete your account setup
3. Get your API keys from the Stripe Dashboard

### 2. Get Stripe API Keys
1. Go to [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. Use test keys for development (they start with `pk_test_` and `sk_test_`)

### 3. Environment Variables

Add these to your backend `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product IDs (will be created in step 5)
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id_here
```

Add these to your frontend `.env` file:

```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 4. Install Dependencies

Dependencies are already installed! ✅
- Backend: `stripe` package
- Frontend: `@stripe/stripe-js` package

### 5. Create Stripe Products and Prices

Run the setup script to create products in your Stripe account:

```bash
cd backend
node setup-stripe-products.js
```

This will:
- Create a "Leedz Pro Subscription" product
- Create monthly ($29/month) and yearly ($290/year) prices
- Output the price IDs to add to your `.env` file

### 6. Set Up Webhooks

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/billing/webhook`
   - For local development: `https://your-ngrok-url.ngrok.io/api/billing/webhook`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it to your `.env` as `STRIPE_WEBHOOK_SECRET`

### 7. Run Database Migration

The Stripe fields have been added to the database:

```bash
cd backend
node migrations/run_migrations.js
```

## 🛠 Development Setup

### Local Testing with ngrok

For webhook testing in development:

1. Install ngrok: `npm install -g ngrok`
2. Start your backend server: `npm run dev`
3. In another terminal: `ngrok http 3001`
4. Use the ngrok URL for webhook endpoint in Stripe Dashboard

### Test Cards

Use these test card numbers in development:

- **Success**: `4242 4242 4242 4242`
- **Requires 3D Secure**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Use any future expiration date, any 3-digit CVC, and any postal code.

## 🔧 Configuration Details

### Subscription Plans

**Monthly Plan**: $29/month
- 10,000 lead searches per month
- Google Sheets integration
- Priority support

**Yearly Plan**: $290/year (2 months free)
- Same features as monthly
- 17% discount

### Webhook Events

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | User completes payment | Activate subscription |
| `customer.subscription.created` | New subscription | Update user status |
| `customer.subscription.updated` | Subscription changed | Update user status |
| `customer.subscription.deleted` | Subscription cancelled | Deactivate access |
| `invoice.paid` | Successful payment | Ensure access continues |
| `invoice.payment_failed` | Payment failed | Send notification |

## 🚦 Testing the Integration

### 1. Test Subscription Flow

1. Start the application
2. Log in and go to Settings > Billing
3. Click "Subscribe to Leedz Pro"
4. Use test card `4242 4242 4242 4242`
5. Complete checkout
6. Verify you're redirected to success page
7. Check that subscription status shows as "Active"

### 2. Test Customer Portal

1. With an active subscription, go to Settings > Billing
2. Click "Manage Billing"
3. Verify you can update payment methods
4. Test cancelling subscription
5. Verify status updates in the app

### 3. Test Webhook Handling

1. Check webhook logs in Stripe Dashboard
2. Verify events are being received successfully
3. Check database for proper status updates

## 🔒 Security Considerations

### Production Checklist

- [ ] Use live Stripe keys (start with `pk_live_` and `sk_live_`)
- [ ] Set up proper webhook endpoint with HTTPS
- [ ] Verify webhook signatures
- [ ] Use environment variables for all secrets
- [ ] Enable Stripe fraud detection
- [ ] Set up monitoring for failed webhooks

### Environment Variables

**Backend (.env)**:
```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_your_live_monthly_price_id
STRIPE_YEARLY_PRICE_ID=price_your_live_yearly_price_id
```

**Frontend (.env)**:
```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

## 📊 Features Included

### ✅ Implemented Features

- Stripe Checkout for subscriptions
- Webhook handling for subscription events
- Customer Portal for billing management
- Subscription status enforcement
- Database tracking of customers and subscriptions
- Success/cancel pages
- Billing UI in settings
- Subscription prompts for inactive users

### 🔮 Future Enhancements

- Usage-based billing
- Multiple subscription tiers
- Proration handling
- Invoice customization
- Payment method management
- Subscription analytics

## 🆘 Troubleshooting

### Common Issues

**Webhook not receiving events**:
- Verify endpoint URL is correct and accessible
- Check webhook signing secret
- Ensure server is running and reachable

**Subscription not activating**:
- Check webhook logs for errors
- Verify customer ID mapping
- Check database for subscription updates

**Checkout not working**:
- Verify publishable key is correct
- Check for JavaScript errors in browser console
- Ensure price IDs are valid

### Support

For issues with this integration:
1. Check Stripe Dashboard logs
2. Review application logs
3. Verify environment variables
4. Test with Stripe's test cards

---

## 🎉 You're Ready!

After completing this setup, your Leedz application will have a fully functional Stripe subscription system. Users can subscribe, manage their billing, and you'll receive real-time updates via webhooks.

For any questions or issues, check the Stripe documentation or reach out to support. 