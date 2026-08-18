"use client";

import { Archive, CalendarPlus, Pencil, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActivitySummary, getActivityState } from "@/types/activities.types";

const LIFE_AREA_LABEL: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  PERSONAL: "Personal",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  OTHER: "Other",
};

interface PlanActivityCardProps {
  activity: ActivitySummary;
  onPush: (activity: ActivitySummary) => void;
  onUnpush: (activity: ActivitySummary) => void;
  onEdit: (activity: ActivitySummary) => void;
  onArchive: (activity: ActivitySummary) => void;
  pending?: boolean;
  className?: string;
}

const ghostIconButton =
  "inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-800/60 hover:text-neutral-200 disabled:pointer-events-none disabled:opacity-40";

// Browsing-context sibling of ActivityCard (which is bound to a
// TodayInstance and doing-context actions). Plan is for holding and
// deciding, not doing — see plan-workspace README §5: deliberately no
// Mark Done / progress / timer controls here.
export function PlanActivityCard({
  activity,
  onPush,
  onUnpush,
  onEdit,
  onArchive,
  pending = false,
  className,
}: PlanActivityCardProps) {
  const state = getActivityState(activity);

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-3 rounded-xl border border-white/5 bg-neutral-800/60 p-4 transition-colors hover:bg-neutral-800/90",
        className,
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-semibold text-white">{activity.title}</p>
          {state === "QUEUED" && (
            <span className="inline-flex shrink-0 items-center rounded-lg border border-white/10 bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-300">
              Queued → tomorrow
            </span>
          )}
        </div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
          {LIFE_AREA_LABEL[activity.lifeArea] ?? activity.lifeArea}
        </p>
        {activity.description && (
          <p className="line-clamp-2 text-xs text-neutral-500">{activity.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          {activity.basePoints} <span className="font-medium text-neutral-500">pts</span>
        </p>

        <div className="flex items-center gap-1">
          {activity.frequency === "ONE_TIME" &&
            (state === "QUEUED" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => onUnpush(activity)}
                className={ghostIconButton}
                aria-label="Un-push from tomorrow"
                title="Un-push from tomorrow"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => onPush(activity)}
                className={ghostIconButton}
                aria-label="Push to tomorrow"
                title="Push to tomorrow"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
              </button>
            ))}
          <button
            type="button"
            disabled={pending}
            onClick={() => onEdit(activity)}
            className={ghostIconButton}
            aria-label="Edit"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onArchive(activity)}
            className={ghostIconButton}
            aria-label="Archive"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}