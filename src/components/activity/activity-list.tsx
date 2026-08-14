"use client";

import * as React from "react";
import { ActivityCard } from "./activity-card";
import { TodayInstance } from "@/types/activities.types";

interface ActivityListProps {
  instances: TodayInstance[];
  onAction: (
    instanceId: string,
    action: string,
    extra?: Record<string, unknown>,
  ) => void | Promise<void>;
  emptyLabel?: string;
}

// Renders today's ActivityInstances via ActivityCard. All data comes
// from the parent (fetched from /api/instances/today) — no mock data.
export function ActivityList({ instances, onAction, emptyLabel }: ActivityListProps) {
  if (instances.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 text-center">
        <p className="text-sm font-semibold text-white">
          {emptyLabel ?? "Nothing here"}
        </p>
        <p className="text-sm text-neutral-500">
          Activities you plan will show up here when they&apos;re due.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {instances.map((instance) => (
        <div key={instance.id} className="h-72">
          <ActivityCard instance={instance} onAction={onAction} />
        </div>
      ))}
    </div>
  );
}
