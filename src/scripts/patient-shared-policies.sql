-- Shared patient registry: all authenticated accounts can read and edit every row.
-- Review and apply through the project's migration process, never from the app.
BEGIN;

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS health_insurance TEXT;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Remove the account-ownership policies introduced by the previous refactor.
DROP POLICY IF EXISTS patient_owner_access ON public.patients;
DROP POLICY IF EXISTS patient_owner_scope ON public.patients;

DROP POLICY IF EXISTS patient_shared_access ON public.patients;
CREATE POLICY patient_shared_access ON public.patients
  AS PERMISSIVE FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Keep anonymous access blocked even if an older permissive policy still exists.
DROP POLICY IF EXISTS patient_authenticated_scope ON public.patients;
CREATE POLICY patient_authenticated_scope ON public.patients
  AS RESTRICTIVE FOR ALL TO PUBLIC
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

COMMIT;
