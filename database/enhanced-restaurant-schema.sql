-- Enhanced Restaurant Schema with USPS Standard Address Fields
-- Run this in your Supabase SQL Editor

-- Update restaurants table to include detailed address fields
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS street_number VARCHAR(20);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS street_name VARCHAR(255);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS suite_apt VARCHAR(50);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Add indexes for address search
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_state ON restaurants(state);
CREATE INDEX IF NOT EXISTS idx_restaurants_zip_code ON restaurants(zip_code);

-- Add a computed column for full address formatting
CREATE OR REPLACE FUNCTION format_restaurant_address(
  street_number TEXT,
  street_name TEXT,
  suite_apt TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN TRIM(
    CONCAT(
      COALESCE(street_number, ''), ' ',
      COALESCE(street_name, ''),
      CASE WHEN suite_apt IS NOT NULL AND suite_apt != '' THEN ', ' || suite_apt ELSE '' END,
      ', ',
      COALESCE(city, ''), ', ',
      COALESCE(state, ''), ' ',
      COALESCE(zip_code, '')
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a view for easy address display
CREATE OR REPLACE VIEW restaurants_with_formatted_address AS
SELECT 
  *,
  format_restaurant_address(
    street_number, 
    street_name, 
    suite_apt, 
    city, 
    state, 
    zip_code
  ) AS formatted_address
FROM restaurants;

-- Update RLS policies to ensure address fields are protected
-- (existing policies will handle this automatically)

COMMENT ON COLUMN restaurants.street_number IS 'Street number (e.g., 123)';
COMMENT ON COLUMN restaurants.street_name IS 'Street name (e.g., Main St)';
COMMENT ON COLUMN restaurants.suite_apt IS 'Suite, apartment, or unit number (optional)';
COMMENT ON COLUMN restaurants.city IS 'City name';
COMMENT ON COLUMN restaurants.state IS 'Two-letter state code';
COMMENT ON COLUMN restaurants.zip_code IS 'ZIP code (5 or 9 digits)';
