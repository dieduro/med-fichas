"use client";

import React from "react";

import {Button} from "./button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./card";
import {Badge} from "./badge";

import {useOffline} from "@/components/providers/OfflineProvider";

export const SyncControls: React.FC = () => {
  const {isOnline, isSyncing, syncErrors, lastSyncTime, manualSync, flushSyncQueue} = useOffline();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sync Controls</CardTitle>
          <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <CardDescription>Manage data synchronization with the server</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            disabled={!isOnline || isSyncing}
            variant="default"
            onClick={manualSync}
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button
            className="flex-1"
            disabled={isSyncing}
            variant="destructive"
            onClick={flushSyncQueue}
          >
            Flush Sync Queue
          </Button>
        </div>

        {syncErrors.length > 0 && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <h4 className="font-medium">Sync Errors:</h4>
            <ul className="mt-1 list-inside list-disc">
              {syncErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {lastSyncTime ? (
          <p className="text-sm text-muted-foreground">
            Last synced: {lastSyncTime.toLocaleString()}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default SyncControls;
