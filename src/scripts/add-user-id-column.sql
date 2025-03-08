-- Add user_id column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Set default value for existing records
UPDATE patients SET user_id = 'system' WHERE user_id IS NULL;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' AND column_name = 'user_id';

-- Show the first few patients to verify the user_id values
SELECT id, full_name, user_id 
FROM patients 
LIMIT 5; 