-- Superseded by patient-shared-policies.sql. This inspection does not assign owners.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'patients';
