-- Migration: Remove user_name column from payment_requests table
-- This column is no longer needed as we use the user relation instead

-- Drop the user_name column
ALTER TABLE payment_requests 
DROP COLUMN IF EXISTS user_name;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payment_requests'
ORDER BY ordinal_position;
