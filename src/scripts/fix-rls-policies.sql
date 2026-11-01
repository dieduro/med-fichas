-- Read-only inspection. Do not disable RLS to work around synchronization errors.
-- For the reviewed shared-policy migration see patient-shared-policies.sql
-- and docs/patient-storage.md.
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'patients';
