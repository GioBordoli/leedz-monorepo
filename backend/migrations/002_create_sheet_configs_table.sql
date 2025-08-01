-- Migration: 002_create_sheet_configs_table.sql
-- Description: Create sheet_configs table for storing user Google Sheets settings
-- Date: 2025-08-01

CREATE TABLE IF NOT EXISTS sheet_configs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spreadsheet_id VARCHAR(255) NOT NULL, -- Google Sheets spreadsheet ID
  spreadsheet_name VARCHAR(255) NOT NULL, -- User-friendly spreadsheet name
  sheet_tab_name VARCHAR(255) NOT NULL, -- Name of the specific sheet tab
  is_active BOOLEAN DEFAULT true, -- Whether this config is currently active
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for fast user sheet lookups
CREATE INDEX IF NOT EXISTS idx_sheet_configs_user_id ON sheet_configs(user_id);

-- Create index on active configs for quick filtering
CREATE INDEX IF NOT EXISTS idx_sheet_configs_active ON sheet_configs(user_id, is_active);

-- Create unique constraint to prevent duplicate active configs per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_sheet_configs_user_active 
ON sheet_configs(user_id) 
WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE sheet_configs IS 'Stores user Google Sheets configuration for lead streaming';
COMMENT ON COLUMN sheet_configs.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN sheet_configs.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN sheet_configs.spreadsheet_id IS 'Google Sheets spreadsheet unique identifier';
COMMENT ON COLUMN sheet_configs.spreadsheet_name IS 'User-friendly name for the spreadsheet';
COMMENT ON COLUMN sheet_configs.sheet_tab_name IS 'Name of the specific sheet tab to write leads to';
COMMENT ON COLUMN sheet_configs.is_active IS 'Whether this configuration is currently active for the user'; 