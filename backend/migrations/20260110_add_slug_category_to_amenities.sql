-- Migration: Add slug and category columns to amenities table
-- Date: 2026-01-10
-- Description: Adds slug and category fields to support type-specific amenity filtering

-- Add slug column
ALTER TABLE amenities 
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Add category column
ALTER TABLE amenities 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';

-- Add comments
COMMENT ON COLUMN amenities.slug IS 'URL-friendly identifier for the amenity';
COMMENT ON COLUMN amenities.category IS 'Category: general, habitacion, pension';

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_amenities_category ON amenities(category);
