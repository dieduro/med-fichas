"use client";

import React from "react";

import {useOffline} from "../providers/OfflineProvider";

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";

export const SubtleOfflineIndicator: React.FC = () => {
  const {isOnline, lastSyncTime} = useOffline();

  // Format the last sync time
  const formattedLastSync = lastSyncTime
    ? new Intl.DateTimeFormat("default", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      }).format(lastSyncTime)
    : "Never";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <div
              aria-label={isOnline ? "Online" : "Offline"}
              className={cn(
                "h-3 w-3 rounded-full transition-colors duration-300",
                isOnline ? "bg-green-500" : "bg-amber-500",
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isOnline ? "Online" : "Offline"}</p>
          {lastSyncTime ? (
            <p className="text-xs opacity-75">Last sync: {formattedLastSync}</p>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SubtleOfflineIndicator;
