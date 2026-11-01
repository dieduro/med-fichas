-- Deprecated: patient records are shared across authenticated accounts.
-- Do not install owner-only policies. Review patient-shared-policies.sql instead.
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'patients';
