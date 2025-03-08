# Updating Row Level Security (RLS) Policies in Supabase

This guide will help you update the Row Level Security (RLS) policies for the `patients` table in Supabase to fix the sync issue.

## Background

The error message `"Could not find the 'user_id' column of 'patients' in the schema cache"` indicates that the `user_id` column doesn't exist in your `patients` table in Supabase.

## Step 1: Add the user_id Column (REQUIRED)

First, you need to add the `user_id` column to your `patients` table. Run this SQL query in the Supabase SQL Editor:

```sql
-- Add user_id column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Set default value for existing records
UPDATE patients SET user_id = 'system' WHERE user_id IS NULL;
```

## Step 2: Update RLS Policies (Optional)

After adding the `user_id` column, you may want to update the RLS policies to allow access based on this field.

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL query to check the current RLS policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'patients';
```

4. Based on the results, you can update the RLS policies to allow the sync operation to work correctly. Here are some options:

### Option 1: Allow access based on user_id field

```sql
-- Enable RLS on the patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select their own patients
CREATE POLICY "Users can view their own patients" 
ON patients FOR SELECT 
USING (user_id = auth.uid() OR user_id = 'system');

-- Create a policy that allows users to insert their own patients
CREATE POLICY "Users can insert their own patients" 
ON patients FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id = 'system');

-- Create a policy that allows users to update their own patients
CREATE POLICY "Users can update their own patients" 
ON patients FOR UPDATE 
USING (user_id = auth.uid() OR user_id = 'system')
WITH CHECK (user_id = auth.uid() OR user_id = 'system');

-- Create a policy that allows users to delete their own patients
CREATE POLICY "Users can delete their own patients" 
ON patients FOR DELETE 
USING (user_id = auth.uid() OR user_id = 'system');
```

### Option 2: Allow access to all authenticated users (less secure)

```sql
-- Enable RLS on the patients table
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to access all patients
CREATE POLICY "Authenticated users can access all patients" 
ON patients 
USING (auth.role() = 'authenticated');
```

### Option 3: Temporarily disable RLS for testing

```sql
-- Temporarily disable RLS on the patients table
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
```

**Note**: Option 3 is not recommended for production environments as it removes all security restrictions.

## Testing

After adding the `user_id` column and updating the RLS policies, you can test the sync functionality by:

1. Going offline (disable your network connection)
2. Adding a new patient
3. Going back online (enable your network connection)
4. The data should automatically sync to Supabase
5. If it doesn't, you can click the sync button in the OfflineIndicator to manually trigger a sync
6. Check the console logs for detailed information about the sync process 