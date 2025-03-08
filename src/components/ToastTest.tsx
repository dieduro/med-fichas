"use client";

import React from "react";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";

export const ToastTest: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 rounded-md border bg-background p-4 shadow-md">
      <h3 className="text-lg font-semibold">Toast Test Panel</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="default" onClick={() => toast.success("Success toast!")}>
          Success
        </Button>
        <Button size="sm" variant="destructive" onClick={() => toast.error("Error toast!")}>
          Error
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.info("Info toast!")}>
          Info
        </Button>
        <Button size="sm" variant="secondary" onClick={() => toast.warning("Warning toast!")}>
          Warning
        </Button>
        <Button size="sm" variant="ghost" onClick={() => toast.loading("Loading toast...")}>
          Loading
        </Button>
        <Button
          size="sm"
          variant="link"
          onClick={() => {
            const toastId = toast.loading("Processing...");

            setTimeout(() => {
              toast.success("Completed!", {id: toastId});
            }, 2000);
          }}
        >
          Promise
        </Button>
      </div>
    </div>
  );
};
