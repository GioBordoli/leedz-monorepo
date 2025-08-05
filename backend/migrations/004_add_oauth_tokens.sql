-- Migration: 004_add_oauth_tokens.sql
-- Description: Add OAuth token fields for Google Sheets integration
-- Date: 2025-01-27

-- Add OAuth token fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.google_access_token IS 'Google OAuth access token for Sheets API access';
COMMENT ON COLUMN users.google_refresh_token IS 'Google OAuth refresh token for token renewal';

-- Create index for token lookups (if needed for performance)
CREATE INDEX IF NOT EXISTS idx_users_access_token ON users(google_access_token) WHERE google_access_token IS NOT NULL; 