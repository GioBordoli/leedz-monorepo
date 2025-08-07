-- Migration: Add Stripe-related fields to users table
-- Description: Adds customer ID and subscription ID tracking for Stripe integration

ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'basic';

-- Add indices for performance
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_subscription_id ON users(stripe_subscription_id);

-- Update existing users to have inactive subscription status if null
UPDATE users SET subscription_status = 'inactive' WHERE subscription_status IS NULL; 