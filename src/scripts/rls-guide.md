# Patient ownership and RLS

See [the patient storage rollout](../../docs/patient-storage.md) for ownership reconciliation, the reviewed policy migration, and account-isolation checks.

Do not disable RLS or grant access to `user_id = 'system'` to resolve synchronization errors. The patient module retains failed changes locally and shows the error until the session or permissions are corrected.
