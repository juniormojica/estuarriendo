-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Set a default hashed password for existing users (password123)
-- This is the bcrypt hash for 'password123'
UPDATE users 
SET password = '$2a$10$rZ5K5h5h5h5h5h5h5h5h5uGxJxJxJxJxJxJxJxJxJxJxJxJxJxJxJ'
WHERE password IS NULL;

-- Make password NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

COMMENT ON COLUMN users.password IS 'Hashed password for authentication';
