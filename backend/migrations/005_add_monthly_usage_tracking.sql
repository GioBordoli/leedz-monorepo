-- Migration: 005_add_monthly_usage_tracking.sql
-- Description: Add monthly usage tracking and migrate from daily to monthly limits
-- Date: 2025-01-27
-- Purpose: Change API limits from 1000/day to 10,000/month as per PM requirements

-- Add new monthly usage tracking columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS monthly_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE);

-- Migrate existing daily usage data to monthly
-- For users with daily counts, transfer to monthly and reset for current month
UPDATE users SET 
  monthly_usage_count = CASE 
    WHEN usage_reset_date >= DATE_TRUNC('month', CURRENT_DATE) THEN daily_usage_count
    ELSE 0
  END,
  usage_reset_month = DATE_TRUNC('month', CURRENT_DATE)
WHERE monthly_usage_count = 0; -- Only update if not already set

-- Create index for efficient monthly usage queries
CREATE INDEX IF NOT EXISTS idx_users_monthly_usage ON users(monthly_usage_count, usage_reset_month);

-- Add comments for documentation
COMMENT ON COLUMN users.monthly_usage_count IS 'Number of API calls made in the current month (limit: 10,000)';
COMMENT ON COLUMN users.usage_reset_month IS 'Start date of the current monthly billing cycle';

-- Note: We keep daily_usage_count and usage_reset_date for backward compatibility
-- They can be removed in a future migration once monthly tracking is stable 