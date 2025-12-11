-- Add plan and verification_status columns to users table
-- Run this migration to add missing columns

-- Add plan column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium'));

-- Add verification_status column  
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'verified', 'rejected'));

-- Update existing users to have default values
UPDATE users SET plan = 'free' WHERE plan IS NULL;
UPDATE users SET verification_status = 'not_submitted' WHERE verification_status IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN plan SET NOT NULL;
ALTER TABLE users ALTER COLUMN verification_status SET NOT NULL;

COMMENT ON COLUMN users.plan IS 'Current user plan (denormalized from subscriptions)';
COMMENT ON COLUMN users.verification_status IS 'User verification status';
