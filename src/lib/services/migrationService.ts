import {syncService} from "./syncService";

// Service for handling database schema migrations
export const migrationService = {
  // Current schema version - increment this when making schema changes
  CURRENT_SCHEMA_VERSION: 1,

  // Get the stored schema version
  async getStoredSchemaVersion(): Promise<number> {
    try {
      // Try to get the schema version from localStorage
      const storedVersion = localStorage.getItem("schemaVersion");

      return storedVersion ? parseInt(storedVersion, 10) : 0;
    } catch (error) {
      console.error("Error getting stored schema version:", error);

      return 0;
    }
  },

  // Set the stored schema version
  async setStoredSchemaVersion(version: number): Promise<void> {
    try {
      localStorage.setItem("schemaVersion", version.toString());
    } catch (error) {
      console.error("Error setting stored schema version:", error);
    }
  },

  // Check if a migration is needed
  async isMigrationNeeded(): Promise<boolean> {
    const storedVersion = await this.getStoredSchemaVersion();

    return storedVersion < this.CURRENT_SCHEMA_VERSION;
  },

  // Run migrations if needed
  async runMigrationsIfNeeded(): Promise<{success: boolean; error?: string}> {
    try {
      const storedVersion = await this.getStoredSchemaVersion();

      if (storedVersion < this.CURRENT_SCHEMA_VERSION) {
        console.log(
          `Migration needed: from version ${storedVersion} to ${this.CURRENT_SCHEMA_VERSION}`,
        );

        // Run migrations based on the stored version
        if (storedVersion === 0) {
          // Initial migration or migration from unversioned schema
          await this.migrateFromUnversioned();
        }

        // Add more migration paths as needed
        // if (storedVersion === 1) {
        //   await this.migrateFrom1To2();
        // }

        // Update the stored schema version
        await this.setStoredSchemaVersion(this.CURRENT_SCHEMA_VERSION);

        return {success: true};
      }

      return {success: true};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error("Error running migrations:", errorMessage);

      return {success: false, error: errorMessage};
    }
  },

  // Migration from unversioned schema
  async migrateFromUnversioned(): Promise<void> {
    console.log("Running migration from unversioned schema");

    // 1. Try to sync any pending changes
    if (syncService.isOnline()) {
      await syncService.syncWithSupabase();
    }

    // 2. Sanitize the syncQueue to match the current schema
    await syncService.sanitizeSyncQueue();

    console.log("Migration from unversioned schema completed");
  },

  // Example of a migration from version 1 to 2
  // async migrateFrom1To2(): Promise<void> {
  //   console.log("Running migration from version 1 to 2");
  //
  //   // Implement migration steps here
  //
  //   console.log("Migration from version 1 to 2 completed");
  // },
};

export default migrationService;
