"use client";

import React from "react";
import {Wifi, WifiOff, RefreshCw} from "lucide-react";

import {useOffline} from "../providers/OfflineProvider";

import {Button} from "./button";

import {cn} from "@/lib/utils";

export const OfflineIndicator: React.FC = () => {
  const {isOnline, isSyncing, syncErrors, lastSyncTime, manualSync} = useOffline();

  // Format the last sync time
  const formattedLastSync = lastSyncTime
    ? new Intl.DateTimeFormat("default", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }).format(lastSyncTime)
    : "Never";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow-md transition-all duration-300",
          isOnline
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        )}
      >
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span>
          {isOnline ? "Online" : "Offline"}
          {lastSyncTime ? (
            <span className="ml-1 text-xs opacity-75">(Last sync: {formattedLastSync})</span>
          ) : null}
        </span>

        {isOnline ? (
          <Button
            className="ml-2 h-6 w-6 rounded-full p-0"
            disabled={isSyncing}
            size="sm"
            title="Sync now"
            variant="ghost"
            onClick={manualSync}
          >
            <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
            <span className="sr-only">Sync now</span>
          </Button>
        ) : null}
      </div>

      {syncErrors.length > 0 && (
        <div className="mt-2 max-w-xs rounded-md bg-red-100 p-2 text-xs text-red-800 dark:bg-red-900 dark:text-red-100">
          <p className="font-semibold">Sync errors:</p>
          <ul className="ml-2 list-disc">
            {syncErrors.slice(0, 3).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
            {syncErrors.length > 3 && <li>...and {syncErrors.length - 3} more</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
