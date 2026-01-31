-- Add first_name and last_name columns to doctors table if they don't exist
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Update existing doctors with sample names if they don't have names
UPDATE doctors 
SET first_name = 'Sarah', last_name = 'Johnson'
WHERE first_name IS NULL OR last_name IS NULL;

-- Make the columns NOT NULL after updating
ALTER TABLE doctors 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;