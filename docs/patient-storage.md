# Patient storage and rollout

All authenticated accounts share the same patient registry. The patient module owns the local cache, pending changes and synchronization. Screens use `usePatients()` and call the module; they do not read Supabase or IndexedDB directly.

```text
screens → PatientsProvider → patient module
                               ├── per-account Dexie database
                               └── authenticated Supabase adapter
```

## Persistence and synchronization

Historical rows with empty or null names remain readable and appear as “Paciente sin nombre”. This display label is never written back automatically. Saving a form still requires a nonempty name. Malformed responses stop synchronization without clearing the cache; the UI shows a readable message and retry action instead of technical validation details or a false empty registry.

- A save or delete commits the patient and its pending change in one IndexedDB transaction. Success means the change is durable on this device; it may still be pending remotely.
- Each patient has one pending change with a unique revision. New edits replace older pending work. A remote response acknowledges only the revision it sent.
- Synchronization pushes pending changes before downloading a complete remote snapshot. It stops on errors. Downloaded rows never create pending writes and never replace pending local edits or deletes.
- Concurrent requests share one execution. A per-account Web Lock also serializes synchronization across tabs. A browser without Web Locks can save offline but reports that synchronization is unavailable.
- Multiple devices use last-write-wins. This change does not add cross-device conflict history or record merging.
- Subscribers receive cache updates across tabs. Connectivity events, initial startup and the periodic timer trigger synchronization; cleanup stops listeners and prevents requests from continuing under a different account.
- A successful sync time is recorded only after push and pull complete. Errors remain visible; an unreadable cache or failed request is not presented as an empty successful response.
- Clearing the cache removes only rows without pending changes. It never clears the outbox or deletes server records.
- The service worker caches the app shell and static assets. Patient records and the current identity are loaded in the browser. Auth callbacks and Supabase requests are not cached. The root shell is precached and serves patient and admin navigation, including patient URLs not visited before. Native document navigation avoids server-dependent router requests while offline. Installation and sign-in still require a connection.

## Existing data and access policies

Patient records are shared across authenticated accounts. `user_id` is a historical storage field, not a record owner or a read filter. Reads include legacy `system` rows, null values and records written with an account ID during the previous refactor. Saves keep the shared `system` marker for compatibility with the existing schema. There is no ownership mapping or bulk patient update to run.

Offline caches still use `MedFichasDB:user:<authenticated-user-id>`. This keeps session cleanup and pending edits separate on a device; it does not restrict which remote patients an account can see. Logging out stops that account's module and hides its cache. Another authenticated account downloads the same shared remote records into its own cache.

The old `MedFichasDB` database and `offlinePatients` localStorage key are left untouched. The admin screen can export both stores, including the old queue, for manual recovery. The export contains clinical information and must be stored privately. Old pending work is not replayed automatically over newer remote records.

Before deployment:

1. Inspect the existing schema and RLS policies. The fields are `id`, `full_name`, `email`, `phone_number`, `gender`, `dob`, `notes`, `health_insurance`, and `user_id`. Patient IDs are UUIDs. Empty optional dates and genders are sent as SQL nulls.
2. If the earlier `patient-owner-policies.sql` migration was applied, review and apply `src/scripts/patient-shared-policies.sql`. The script removes the two known owner policies and grants shared access to authenticated accounts. A restrictive authenticated-session policy blocks anonymous access even alongside old permissive policies. It preserves every patient row and its existing `user_id`. Other custom restrictive policies must be reviewed separately if they still limit reads.
3. Verify with two authenticated accounts that both can list and edit the same legacy and new patients. Verify anonymous requests are denied. Verify an expired or changed session cannot keep synchronizing the previous account's pending changes.
4. Revisit the PWA online to install the new shell before testing offline navigation. Export old local caches from devices with unsent legacy edits and reconcile them with the current shared records before manual recovery.

SQL migrations are not executed by the application or its tests. Database policy changes should be applied through the project's reviewed migration process. Keep backups and exports until offline recovery has been verified.

## Verification

Run with Node 22.13+ (or a newer supported Node release):

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

Tests exercise the module using real Dexie transactions backed by `fake-indexeddb` and an in-memory remote adapter. Remote adapter tests use the real Supabase query builder with a test HTTP transport. They do not write to a Supabase project. Live RLS and browser/service-worker behavior still need the rollout checks above.

For the production-browser test, build with the isolated public fixture configuration, install Chromium, and run Playwright:

```sh
NEXT_PUBLIC_SUPABASE_URL=https://patients.example.test NEXT_PUBLIC_SUPABASE_ANON_KEY=public-test-key corepack pnpm build
corepack pnpm exec playwright install chromium --only-shell
corepack pnpm test:e2e
```

The browser test mocks the fixture project's HTTP transport and session. It creates a patient while offline, opens its previously unvisited URL, edits and reloads it, reconnects to synchronize the latest edit, and verifies that logout hides the previous account's cache. It never calls a real Supabase project.
