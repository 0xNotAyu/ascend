"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActivityCardProps } from "@/types/activities.types";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ActivityCard({
  instance,
  onAction,
  size = "default",
  className,
}: ActivityCardProps) {
  const compact = size === "compact";
  const { activity } = instance;
  const done = instance.status === "COMPLETED";


  const [pending, setPending] = React.useState(false);
  const fire = async (action: string, extra?: Record<string, unknown>) => {
    setPending(true);
    try {
      await onAction(instance.id, action, extra);
    } finally {
      setPending(false);
    }
  };


  const counterTarget = activity.type === "COUNTER" ? activity.config.target ?? 1 : 1;
  const counterComplete = activity.type === "COUNTER" && instance.progress >= counterTarget;

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-xl border border-white/5 bg-neutral-800/60 transition-colors hover:bg-neutral-800/90",
         "p-3",
        "  bg-neutral-800/90",
        className,
      )}
    >
      <div className={compact ? "space-y-0.5" : "space-y-1"}>
        <p className={cn("font-semibold text-white", compact ? "text-xs" : "text-base")}>
          {activity.title}
        </p>
        {!compact && activity.description && (
          <p className="text-xs text-neutral-500">{activity.description}</p>
        )}
      </div>

  

      

      {/* Actions */}
      {activity.type === "SIMPLE" && (
        <button
          disabled={pending || done}
          onClick={() => fire("complete")}
          className={cn(
            "inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none",
            compact ? "h-7 px-3 text-xs" : "h-8 px-4",
            done
              ? "bg-neutral-800 text-neutral-500"
              : "border border-white/10 bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
          )}
        >
          {done ? (
            <>
              <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              Done
            </>
          ) : (
            "Mark done"
          )}
        </button>
      )}

      {activity.type === "COUNTER" && (
        <div className="flex items-center gap-2">
          {done || counterComplete ? (
            <button
              disabled={pending || done}
              onClick={() => fire("complete")}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none",
                compact ? "h-7 text-xs" : "h-8",
                done
                  ? "bg-neutral-800 text-neutral-500"
                  : "bg-neutral-100 text-neutral-900 hover:bg-white",
              )}
            >
              {done && <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />}
              Done
            </button>
          ) : (
            <div
              className={cn(
                "flex flex-1 items-center justify-between rounded-lg border border-white/10 bg-neutral-800",
                compact ? "h-7" : "h-8",
              )}
            >
              <button
                disabled={pending || instance.progress <= 0}
                onClick={() => fire("decrement")}
                className="flex h-full w-8 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-200 disabled:pointer-events-none disabled:opacity-30"
                aria-label="Decrease"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-medium tabular-nums text-neutral-200">
                {instance.progress}/{counterTarget}
              </span>
              <button
                disabled={pending}
                onClick={() => fire("increment")}
                className="flex h-full w-8 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-200 disabled:pointer-events-none"
                aria-label="Increase"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {activity.type === "TOGGLE" && (
        <div className="flex items-center gap-2">
          {done ? (
            <div
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-neutral-800 text-sm font-medium text-neutral-500",
                compact ? "h-7 text-xs" : "h-8",
              )}
            >
              <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              Done
            </div>
          ) : (
            <>
              {/* Pause / cancel live on the activity board — this card only
                  starts and completes a session. */}
              <button
                disabled={pending }
                onClick={() => fire("start")}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-40",
                  compact ? "h-7 text-xs" : "h-8",
                )}
              >
                <Play className="h-3.5 w-3.5" /> Start
              </button>
              <button
                disabled={pending || (instance.durationSec <= 0)}
                onClick={() => fire("complete")}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg bg-neutral-100 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-40",
                  compact ? "h-7 px-2.5 text-xs" : "h-8 px-3",
                )}
              >
                Complete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}