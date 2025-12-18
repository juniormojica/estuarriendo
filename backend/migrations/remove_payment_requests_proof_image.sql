-- Migration: Remove old proof_image column from payment_requests table
-- This column was replaced by proof_image_url and proof_image_public_id for Cloudinary

-- Drop the old proof_image column if it exists
ALTER TABLE payment_requests 
DROP COLUMN IF EXISTS proof_image;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payment_requests'
ORDER BY ordinal_position;
