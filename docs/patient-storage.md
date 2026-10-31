# Patient storage and rollout

The patient module owns the local cache, pending changes and synchronization. Screens use `usePatients()` and call the module; they do not read Supabase or IndexedDB directly.

```text
screens → PatientsProvider → patient module
                               ├── per-account Dexie database
                               └── authenticated Supabase adapter
```

## Persistence and synchronization

- A save or delete commits the patient and its pending change in one IndexedDB transaction. Success means the change is durable on this device; it may still be pending remotely.
- Each patient has one pending change with a unique revision. New edits replace older pending work. A remote response acknowledges only the revision it sent.
- Synchronization pushes pending changes before downloading a complete remote snapshot. It stops on errors. Downloaded rows never create pending writes and never replace pending local edits or deletes.
- Concurrent requests share one execution. A per-account Web Lock also serializes synchronization across tabs. A browser without Web Locks can save offline but reports that synchronization is unavailable.
- Multiple devices use last-write-wins. This change does not add cross-device conflict history or record merging.
- Subscribers receive cache updates across tabs. Connectivity events, initial startup and the periodic timer trigger synchronization; cleanup stops listeners and prevents requests from continuing under a different account.
- A successful sync time is recorded only after push and pull complete. Errors remain visible; an unreadable cache or failed request is not presented as an empty successful response.
- Clearing the cache removes only rows without pending changes. It never clears the outbox or deletes server records.
- The service worker caches the app shell and static assets. Patient records and the current identity are loaded in the browser. Auth callbacks and Supabase requests are not cached. The root shell is precached and serves patient and admin navigation, including patient URLs not visited before. Native document navigation avoids server-dependent router requests while offline. Installation and sign-in still require a connection.

## Existing data: review before deployment

The previous version writes `user_id = 'system'` and uses a shared `MedFichasDB` database plus an `offlinePatients` localStorage key. Those values do not identify the owner. Automatically attributing them to whichever account signs in would mix accounts.

New databases use `MedFichasDB:user:<authenticated-user-id>`. The old database and localStorage are left untouched. The admin screen can export both stores, including the old queue, for manual recovery. That export contains clinical information and must be stored privately. It is not imported automatically or uploaded anywhere.

Before deploying to an existing Supabase project:

1. Back up the `patients` table and export local legacy data from each device with unsent edits.
2. Inspect the existing `patients` schema and RLS policies. The current patient fields are `id`, `full_name`, `email`, `phone_number`, `gender`, `dob`, `notes`, `health_insurance`, and `user_id`. Patient IDs are UUIDs. Empty optional dates and genders are sent as SQL nulls.
3. Review which authenticated user owns each legacy remote row. Prepare and review an explicit row-to-user mapping. Do not bulk assign shared records to the current user. Reconcile legacy pending edits against the backed-up remote records before importing them for their verified owner.
4. Apply that reviewed ownership mapping and then `src/scripts/patient-owner-policies.sql` through the project's migration process. This repository does not execute either step automatically. Unassigned rows remain in Supabase but are hidden from the new application.
5. Verify with two real accounts: each can list, create, edit and delete its own rows; neither can read or modify the other's rows, including by supplying a known ID. Verify anonymous requests are denied. Also verify reconnection after an expired session.
6. Deploy the application. Revisit the PWA online to install the new app shell before testing offline navigation.

The policy script adds an owner policy and a restrictive owner scope. The restrictive scope also constrains older permissive policies, including old policies allowing `system`. It enables RLS and adds the optional insurance column if absent. It does not delete rows, reassign ownership, or run in the application. Existing server-side administrative jobs that use ordinary authenticated sessions must satisfy the owner policy too.

Application code can be rolled back. Ownership and policy changes require a separately reviewed database rollback. Keep backups and exports until migration and offline recovery have been verified.

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
