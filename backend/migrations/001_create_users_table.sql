-- Migration: 001_create_users_table.sql
-- Description: Create users table for storing user authentication and profile data
-- Date: 2025-08-01

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  google_oauth_id VARCHAR(255) UNIQUE NOT NULL,
  places_api_key TEXT, -- Encrypted Google Places API key
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  daily_usage_count INTEGER DEFAULT 0 CHECK (daily_usage_count >= 0),
  usage_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on google_oauth_id for OAuth flow
CREATE INDEX IF NOT EXISTS idx_users_google_oauth_id ON users(google_oauth_id);

-- Create index on usage_reset_date for daily limit tracking
CREATE INDEX IF NOT EXISTS idx_users_usage_reset_date ON users(usage_reset_date);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user authentication and profile information';
COMMENT ON COLUMN users.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN users.email IS 'User email from Google OAuth';
COMMENT ON COLUMN users.name IS 'User display name from Google OAuth';
COMMENT ON COLUMN users.picture IS 'User profile picture URL from Google OAuth';
COMMENT ON COLUMN users.google_oauth_id IS 'Unique Google OAuth user ID';
COMMENT ON COLUMN users.places_api_key IS 'Encrypted Google Places API key provided by user';
COMMENT ON COLUMN users.subscription_status IS 'User subscription status (active, inactive, cancelled)';
COMMENT ON COLUMN users.daily_usage_count IS 'Number of leads generated today (resets daily)';
COMMENT ON COLUMN users.usage_reset_date IS 'Date when daily usage counter was last reset'; 