-- Review docs/patient-storage.md and assign verified owners BEFORE deployment.
-- Run through the project's reviewed migration process; never from the application.
BEGIN;

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS health_insurance TEXT;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS patient_owner_access ON public.patients;
CREATE POLICY patient_owner_access ON public.patients
  AS PERMISSIVE FOR ALL TO authenticated
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

-- Restrictive policies are ANDed with permissive policies, so old broad grants
-- cannot expose shared or other-account rows to authenticated/anonymous roles.
DROP POLICY IF EXISTS patient_owner_scope ON public.patients;
CREATE POLICY patient_owner_scope ON public.patients
  AS RESTRICTIVE FOR ALL TO PUBLIC
  USING (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text)
  WITH CHECK (auth.uid() IS NOT NULL AND user_id::text = auth.uid()::text);

COMMIT;
