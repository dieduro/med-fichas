"use client";

import React, {createContext, useContext, useEffect, useState} from "react";

import {syncService} from "@/lib/services/syncService";
import {migrationService} from "@/lib/services/migrationService";

// Define the context type
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  syncErrors: string[];
  lastSyncTime: Date | null;
  manualSync: () => Promise<void>;
  flushSyncQueue: () => Promise<void>;
}

// Create the context with default values
const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  syncErrors: [],
  lastSyncTime: null,
  manualSync: async () => {},
  flushSyncQueue: async () => {},
});

// Hook to use the offline context
export const useOffline = () => useContext(OfflineContext);

// Provider component
export const OfflineProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);

  // Handle online status change
  const handleOnline = () => {
    setIsOnline(true);
    // Attempt to sync when coming back online
    syncData();
  };

  // Handle offline status change
  const handleOffline = () => {
    setIsOnline(false);
  };

  // Function to sync data with Supabase
  const syncData = async () => {
    if (!syncService.isOnline() || isSyncing) return;

    setIsSyncing(true);
    setSyncErrors([]);

    try {
      const result = await syncService.syncWithSupabase();

      if (!result.success) {
        setSyncErrors(result.errors);
      }

      setLastSyncTime(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      setSyncErrors([errorMessage]);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual sync function exposed through context
  const manualSync = async () => {
    await syncData();
  };

  // Function to flush the sync queue
  const flushSyncQueue = async () => {
    try {
      console.log("Flushing sync queue...");
      const result = await syncService.flushSyncQueue();

      if (!result.success) {
        console.error("Failed to flush sync queue:", result.error);
        setSyncErrors([`Failed to flush sync queue: ${result.error}`]);
      } else {
        console.log("Sync queue flushed successfully");
        setSyncErrors([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error("Error flushing sync queue:", errorMessage);
      setSyncErrors([`Error flushing sync queue: ${errorMessage}`]);
    }
  };

  // Function to run migrations if needed
  const runMigrations = async () => {
    try {
      setIsMigrating(true);

      // Check if migrations are needed
      const migrationNeeded = await migrationService.isMigrationNeeded();

      if (migrationNeeded) {
        console.log("Running database migrations...");
        const result = await migrationService.runMigrationsIfNeeded();

        if (!result.success) {
          console.error("Migration failed:", result.error);
        } else {
          console.log("Migrations completed successfully");
        }
      } else {
        console.log("No migrations needed");
      }
    } catch (error) {
      console.error("Error running migrations:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  // Initialize online/offline listeners and run migrations
  useEffect(() => {
    // Run migrations first
    runMigrations().then(() => {
      // Then initialize online/offline listeners
      syncService.initListeners(handleOnline, handleOffline);

      // Initial data load if online
      if (syncService.isOnline()) {
        syncService.loadDataFromSupabase();
      }
    });

    // Set up periodic sync (every 5 minutes when online)
    const syncInterval = setInterval(
      () => {
        if (syncService.isOnline()) {
          syncData();
        }
      },
      5 * 60 * 1000,
    );

    return () => {
      syncService.removeListeners(handleOnline, handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  // Context value
  const contextValue: OfflineContextType = {
    isOnline,
    isSyncing,
    syncErrors,
    lastSyncTime,
    manualSync,
    flushSyncQueue,
  };

  return <OfflineContext.Provider value={contextValue}>{children}</OfflineContext.Provider>;
};

export default OfflineProvider;
