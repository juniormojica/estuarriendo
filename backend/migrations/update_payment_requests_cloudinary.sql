-- Migration: Update payment_requests table for Cloudinary integration
-- Remove base64 storage, use Cloudinary URLs instead
-- Remove userName (get from User table via JOIN)

-- Step 1: Add new Cloudinary columns (with defaults for existing rows)
ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS proof_image_url VARCHAR(500) DEFAULT '',
ADD COLUMN IF NOT EXISTS proof_image_public_id VARCHAR(255) DEFAULT '';

-- Step 2: Add comments
COMMENT ON COLUMN payment_requests.proof_image_url IS 'Cloudinary URL of payment proof';
COMMENT ON COLUMN payment_requests.proof_image_public_id IS 'Cloudinary public_id for deletion';

-- Step 3: Drop old columns (after data migration if needed)
-- ALTER TABLE payment_requests DROP COLUMN IF EXISTS user_name;
-- ALTER TABLE payment_requests DROP COLUMN IF EXISTS proof_image;

-- Note: Uncomment Step 3 after migrating existing data to Cloudinary
-- For now, keep old columns to avoid data loss
