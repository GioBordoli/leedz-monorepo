# 🧪 Stripe Integration Testing Checklist

## ✅ Phase 1: Build Verification
- [x] Backend builds without TypeScript errors
- [x] Frontend builds without TypeScript errors
- [x] Database migration runs successfully
- [x] Stripe packages installed correctly

## 🔧 Phase 2: Environment Setup

### Backend Environment Variables (.env)
```bash
# Existing variables (should already be set)
DATABASE_URL=postgresql://leedz_user:leedz_password@localhost:5432/leedz_db
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000

# NEW: Stripe variables to add
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id_here
```

### Frontend Environment Variables (.env)
```bash
# NEW: Stripe variables to add
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
REACT_APP_API_URL=http://localhost:3001
```

### Setup Tasks
- [ ] Add Stripe API keys to backend `.env`
- [ ] Add Stripe publishable key to frontend `.env`
- [ ] Run Stripe product setup script
- [ ] Set up webhook endpoint

## 🧪 Phase 3: Manual Testing

### Test 1: Settings Page Billing Section
**Goal**: Verify billing UI appears correctly

**Steps**:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Log into the application
4. Navigate to Settings page
5. Click on "Billing" in sidebar

**Expected Results**:
- [x] SubscriptionCard component renders
- [ ] Shows "No Active Subscription" status
- [ ] "Subscribe to Leedz Pro" button appears
- [ ] Pricing ($29/month) is displayed

### Test 2: Subscription Flow (Test Mode)
**Goal**: Test complete subscription process

**Prerequisites**: 
- [ ] Stripe account created
- [ ] Test API keys configured
- [ ] Products created via setup script

**Steps**:
1. Click "Subscribe to Leedz Pro" button
2. Should redirect to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout process

**Expected Results**:
- [ ] Redirects to Stripe Checkout
- [ ] Test payment works
- [ ] Redirects to success page
- [ ] Subscription status updates to "Active"
- [ ] User can access lead generation

### Test 3: Webhook Handling
**Goal**: Verify webhooks update subscription status

**Prerequisites**:
- [ ] ngrok or webhook endpoint set up
- [ ] Webhook configured in Stripe Dashboard

**Steps**:
1. Complete a test subscription
2. Check Stripe Dashboard webhook logs
3. Check application database

**Expected Results**:
- [ ] Webhook events received successfully
- [ ] Database updated with subscription info
- [ ] User status changed to active

### Test 4: Customer Portal
**Goal**: Test billing management

**Prerequisites**:
- [ ] Active subscription from Test 2

**Steps**:
1. Go to Settings > Billing
2. Click "Manage Billing" button
3. Should open Stripe Customer Portal

**Expected Results**:
- [ ] Customer Portal opens
- [ ] Can view subscription details
- [ ] Can update payment methods
- [ ] Can cancel subscription

### Test 5: Subscription Enforcement
**Goal**: Verify access control works

**Steps**:
1. Without active subscription, try to search for leads
2. Should be blocked with subscription required message

**Expected Results**:
- [ ] Lead search blocked for inactive users
- [ ] Clear error message about subscription requirement
- [ ] Active subscribers can search normally

## 🐛 Phase 4: Error Testing

### Test 6: Failed Payment
**Steps**:
1. Use declined test card: `4000 0000 0000 9995`
2. Attempt subscription

**Expected Results**:
- [ ] Payment fails gracefully
- [ ] User remains on checkout page
- [ ] No partial subscription created

### Test 7: Webhook Failures
**Steps**:
1. Temporarily break webhook endpoint
2. Complete test subscription
3. Fix endpoint

**Expected Results**:
- [ ] Stripe retries webhooks
- [ ] Status eventually syncs when fixed
- [ ] No data corruption

## 🚀 Phase 5: Production Readiness

### Security Checklist
- [ ] Live Stripe keys configured
- [ ] Webhook signing secret verified
- [ ] HTTPS enabled for webhooks
- [ ] API key encryption working

### Performance Testing
- [ ] Checkout loads quickly
- [ ] Webhook processing is fast
- [ ] No memory leaks in subscription checks

### Monitoring Setup
- [ ] Stripe Dashboard monitoring
- [ ] Application logging for billing events
- [ ] Error alerting configured

## 🎯 Success Criteria

**MVP Ready When**:
- [ ] All manual tests pass
- [ ] Subscription flow works end-to-end
- [ ] Users can subscribe and access features
- [ ] Billing management works
- [ ] Error cases handled gracefully

**Production Ready When**:
- [ ] Live Stripe keys configured
- [ ] Webhook endpoint secured with HTTPS
- [ ] All security checks pass
- [ ] Monitoring and alerts configured

---

## 🔧 Quick Development Setup Commands

```bash
# 1. Install dependencies (already done)
cd backend && npm install stripe
cd frontend && npm install @stripe/stripe-js

# 2. Run database migration
cd backend && node migrations/run_migrations.js

# 3. Create Stripe products (after adding API keys)
cd backend && node setup-stripe-products.js

# 4. Start development servers
cd backend && npm run dev
cd frontend && npm start

# 5. Test with ngrok (for webhooks)
ngrok http 3001
```

## 📞 Next Steps

1. **Environment Setup**: Add Stripe API keys to environment files
2. **Stripe Account**: Create products using setup script
3. **Webhook Setup**: Configure webhook endpoint
4. **Manual Testing**: Go through each test case systematically
5. **Production Deployment**: Switch to live keys and secure webhook endpoint

Once all checklist items are complete, the Stripe integration will be fully functional and ready for production! 