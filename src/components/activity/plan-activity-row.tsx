"use client";

import { Archive, CalendarPlus, Pencil, Undo2 } from "lucide-react";

import {
  ActivitySummary,
  getActivityState,
} from "@/types/activities.types";

const LIFE_AREA_LABEL: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  PERSONAL: "Personal",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  OTHER: "Other",
};

interface PlanActivityRowProps {
  activity: ActivitySummary;
  onPush: (activity: ActivitySummary) => void;
  onUnpush: (activity: ActivitySummary) => void;
  onEdit: (activity: ActivitySummary) => void;
  onArchive: (activity: ActivitySummary) => void;
  pending?: boolean;
}

const ghostIconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 disabled:pointer-events-none disabled:opacity-40";

export function PlanActivityRow({
  activity,
  onPush,
  onUnpush,
  onEdit,
  onArchive,
  pending = false,
}: PlanActivityRowProps) {
  const state = getActivityState(activity);

  return (
    <div className="group flex min-h-[64px] items-center px-5 py-3 transition-colors hover:bg-white/[0.025]">
      {/* Title */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-3">
          <p className="truncate text-sm font-semibold text-white">
            {activity.title}
          </p>

          {/* Life area beside title */}
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            {LIFE_AREA_LABEL[activity.lifeArea] ?? activity.lifeArea}
          </span>

          {/* Description */}
          {activity.description && (
            <>
              <span className="shrink-0 text-neutral-700">·</span>
              <p className="min-w-0 truncate text-xs text-neutral-500">
                {activity.description}
              </p>
            </>
          )}

          {/* Queued */}
          {state === "QUEUED" && (
            <span className="shrink-0 rounded-md border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-neutral-400">
              Queued
            </span>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="ml-6 w-20 shrink-0 text-right">
        <span className="text-sm font-semibold text-white">
          {activity.basePoints}
        </span>
        <span className="ml-1 text-xs text-neutral-500">
          pts
        </span>
      </div>

      {/* Actions */}
      <div className="ml-6 flex w-28 shrink-0 items-center justify-end gap-1">
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
  );
}