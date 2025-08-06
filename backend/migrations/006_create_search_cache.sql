-- Migration: 006_create_search_cache.sql
-- Description: Create search cache table to prevent duplicate lead scraping
-- Date: 2025-01-27
-- Purpose: Avoid returning same leads for repeat searches (user + location + business_type)

CREATE TABLE search_cache (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_normalized VARCHAR(255) NOT NULL,
  business_type VARCHAR(255) NOT NULL,
  place_id VARCHAR(255) NOT NULL,
  lead_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

-- Indexes for performance
CREATE INDEX idx_search_cache_user_location_type ON search_cache(user_id, location_normalized, business_type);
CREATE INDEX idx_search_cache_place_id ON search_cache(place_id);
CREATE INDEX idx_search_cache_expires ON search_cache(expires_at);

-- Unique constraint to prevent duplicate place_ids per user
CREATE UNIQUE INDEX idx_search_cache_user_place_unique 
ON search_cache(user_id, place_id);

-- Add comments for documentation
COMMENT ON TABLE search_cache IS 'Caches search results to prevent duplicate lead scraping for repeat searches';
COMMENT ON COLUMN search_cache.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN search_cache.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN search_cache.location_normalized IS 'Normalized location string for consistent matching';
COMMENT ON COLUMN search_cache.business_type IS 'Business type searched for';
COMMENT ON COLUMN search_cache.place_id IS 'Google Places unique identifier for the business';
COMMENT ON COLUMN search_cache.lead_data IS 'Complete lead data as JSON for quick retrieval';
COMMENT ON COLUMN search_cache.expires_at IS 'When this cache entry expires (7 days from creation)';

-- Create a function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up automated cleanup (can be enabled if pg_cron is available)
-- SELECT cron.schedule('cleanup-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();'); 