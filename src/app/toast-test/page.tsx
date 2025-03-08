"use client";

import React from "react";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default function ToastTestPage() {
  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Toast Test Page</CardTitle>
          <CardDescription>Test different toast notifications</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button onClick={() => toast.success("Success toast!")}>Success</Button>
          <Button variant="destructive" onClick={() => toast.error("Error toast!")}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.info("Info toast!")}>
            Info
          </Button>
          <Button variant="secondary" onClick={() => toast.warning("Warning toast!")}>
            Warning
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              const id = toast.loading("Loading...");

              setTimeout(() => {
                toast.success("Completed!", {id});
              }, 2000);
            }}
          >
            Loading → Success
          </Button>
          <Button
            variant="link"
            onClick={() => {
              toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
                loading: "Loading...",
                success: "Promise resolved!",
                error: "Promise rejected!",
              });
            }}
          >
            Promise
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
