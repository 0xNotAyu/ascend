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

// Renders today's ActivityInstances via ActivityCard.
// Shows 4 cards at a time and scrolls horizontally for additional cards.
export function ActivityList({
  instances,
  onAction,
  emptyLabel,
}: ActivityListProps) {
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
  <div className="relative w-full overflow-hidden rounded-2xl">
    <div className="overflow-x-auto rounded-2xl px-1 pb-4">
      <div className="grid auto-cols-[calc((100%-48px)/4)] grid-flow-col gap-4">
        {instances.map((instance) => (
          <div key={instance.id} className="h-72">
            <ActivityCard
              instance={instance}
              onAction={onAction}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);
}