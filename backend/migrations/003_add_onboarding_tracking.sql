-- Migration: Add onboarding tracking fields to users table
-- Purpose: Track user onboarding status in backend instead of localStorage
-- Date: 2025-08-02

-- Add onboarding tracking columns
ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN first_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for performance
CREATE INDEX idx_users_onboarding_status ON users(has_completed_onboarding);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Update existing users to have proper login tracking
UPDATE users SET 
  first_login_at = created_at,
  last_login_at = updated_at
WHERE first_login_at IS NULL; 