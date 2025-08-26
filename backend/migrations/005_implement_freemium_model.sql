-- Migration: 005_implement_freemium_model.sql
-- Description: Implement freemium model by changing default subscription status
-- Purpose: Enable free tier with 1000 leads/month limit
-- Date: 2025-08-25

-- ================================================================
-- STEP 1: Update default subscription status for new users
-- ================================================================
ALTER TABLE users ALTER COLUMN subscription_status SET DEFAULT 'inactive';

-- ================================================================
-- STEP 2: Update existing test users to free tier
-- Only update users who don't have Stripe customer ID (indicating they haven't paid)
-- ================================================================
UPDATE users 
SET subscription_status = 'inactive' 
WHERE subscription_status = 'active' 
  AND stripe_customer_id IS NULL
  AND stripe_subscription_id IS NULL;

-- ================================================================
-- STEP 3: Add performance indexes for freemium queries
-- ================================================================

-- Index for subscription status queries (used frequently in tier checks)
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Index for monthly usage queries (used in limit enforcement)
CREATE INDEX IF NOT EXISTS idx_users_monthly_usage ON users(monthly_usage_count);

-- Composite index for tier-based usage queries
CREATE INDEX IF NOT EXISTS idx_users_tier_usage ON users(subscription_status, monthly_usage_count);

-- Index for usage reset date queries
CREATE INDEX IF NOT EXISTS idx_users_usage_reset_month ON users(usage_reset_month);

-- ================================================================
-- STEP 4: Add helpful comments for documentation
-- ================================================================
COMMENT ON COLUMN users.subscription_status IS 'User subscription tier: active=Pro (unlimited), inactive=Free (1000/month), cancelled=Expired';
COMMENT ON COLUMN users.monthly_usage_count IS 'Number of leads generated this month (resets monthly)';
COMMENT ON COLUMN users.usage_reset_month IS 'Date when monthly usage counter was last reset (user anniversary-based)';

-- ================================================================
-- STEP 5: Verification queries (commented out for production)
-- ================================================================

-- Verify the changes (uncomment for manual verification):
-- SELECT subscription_status, COUNT(*) as user_count 
-- FROM users 
-- GROUP BY subscription_status;

-- Verify indexes were created:
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE tablename = 'users' 
-- AND indexname LIKE 'idx_users_%';

-- ================================================================
-- Migration completed successfully
-- ================================================================ 