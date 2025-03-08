-- First, check the current RLS policies
SELECT * FROM pg_policies WHERE tablename = 'patients';

-- Disable RLS temporarily to see if that resolves the issue
-- (You can re-enable it later with more specific policies)
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS enabled but allow the sync operations,
-- you can use one of these approaches instead:

-- OPTION 1: Create a policy that allows all operations for rows with user_id = 'system'
-- (Uncomment these lines if you want to use this approach)
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow system access" ON patients;
-- CREATE POLICY "Allow system access" ON patients
--   USING (user_id = 'system')
--   WITH CHECK (user_id = 'system');

-- OPTION 2: Create separate policies for each operation
-- (Uncomment these lines if you want to use this approach)
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- 
-- -- Drop existing policies if they exist
-- DROP POLICY IF EXISTS "Allow select" ON patients;
-- DROP POLICY IF EXISTS "Allow insert" ON patients;
-- DROP POLICY IF EXISTS "Allow update" ON patients;
-- DROP POLICY IF EXISTS "Allow delete" ON patients;
-- 
-- -- Create new policies
-- CREATE POLICY "Allow select" ON patients FOR SELECT USING (true);
-- CREATE POLICY "Allow insert" ON patients FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow update" ON patients FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow delete" ON patients FOR DELETE USING (true);

-- Verify the policies after changes
SELECT * FROM pg_policies WHERE tablename = 'patients'; 