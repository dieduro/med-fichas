"use client";

import React, {createContext, useContext, useEffect, useState} from "react";

import {syncService} from "@/lib/services/syncService";

// Define the context type
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  syncErrors: string[];
  lastSyncTime: Date | null;
  manualSync: () => Promise<void>;
}

// Create the context with default values
const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  syncErrors: [],
  lastSyncTime: null,
  manualSync: async () => {},
});

// Hook to use the offline context
export const useOffline = () => useContext(OfflineContext);

// Provider component
export const OfflineProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

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

  // Initialize online/offline listeners
  useEffect(() => {
    syncService.initListeners(handleOnline, handleOffline);

    // Initial data load if online
    if (syncService.isOnline()) {
      syncService.loadDataFromSupabase();
    }

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
  };

  return <OfflineContext.Provider value={contextValue}>{children}</OfflineContext.Provider>;
};

export default OfflineProvider;
