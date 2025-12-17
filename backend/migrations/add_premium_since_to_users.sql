-- Add premium_since column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP NULL;

-- Add comment to the column
COMMENT ON COLUMN users.premium_since IS 'When user first became premium';
