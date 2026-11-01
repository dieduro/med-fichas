# Shared patient access and RLS

All authenticated accounts share the patient registry. See [the patient storage rollout](../../docs/patient-storage.md) for the shared-policy migration and access checks.

Do not disable RLS to resolve synchronization errors. Apply the reviewed `patient-shared-policies.sql` migration if the earlier owner-only policies were installed. The patient module retains failed changes locally and shows the error until the session or permissions are corrected.
