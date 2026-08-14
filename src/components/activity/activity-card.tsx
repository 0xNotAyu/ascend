"use client";

import * as React from "react";
import { Check, Minus, Pause, Play, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActivityCardProps } from "@/types/activities.types";

const LIFE_AREA_LABEL: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  PERSONAL: "Personal",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  OTHER: "Other",
};

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

  // Local ticking clock while a TOGGLE session is running, so the
  // elapsed time visibly moves without waiting on a server round trip.
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!instance.sessionStart) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [instance.sessionStart]);

  const [pending, setPending] = React.useState(false);
  const fire = async (action: string, extra?: Record<string, unknown>) => {
    setPending(true);
    try {
      await onAction(instance.id, action, extra);
    } finally {
      setPending(false);
    }
  };

  const runningSec = instance.sessionStart
    ? instance.durationSec + Math.max(0, Math.round((now - new Date(instance.sessionStart).getTime()) / 1000))
    : instance.durationSec;

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-xl border border-white/5 bg-neutral-800/60 transition-colors hover:bg-neutral-800/90",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <div className={compact ? "space-y-0.5" : "space-y-1"}>
        <p className={cn("font-semibold text-white", compact ? "text-xs" : "text-base")}>
          {activity.title}
        </p>
        <p
          className={cn(
            "font-medium uppercase tracking-wide text-neutral-500",
            compact ? "text-[8px]" : "text-[10px]",
          )}
        >
          {LIFE_AREA_LABEL[activity.lifeArea] ?? activity.lifeArea}
        </p>
      </div>

      {/* Type-specific body */}
      {activity.type === "COUNTER" && !compact && (
        <div className="my-2 space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-700">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${Math.min(100, Math.round((instance.progress / (activity.config.target || 1)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-xs font-medium text-neutral-400">
            {instance.progress} / {activity.config.target ?? 1}
            {activity.config.unit ? ` ${activity.config.unit}` : ""}
          </p>
        </div>
      )}

      {activity.type === "TOGGLE" && !compact && (
        <p className="my-2 text-lg font-semibold tabular-nums text-white">
          {formatDuration(runningSec)}
        </p>
      )}

      <p className={cn("font-semibold text-white", compact ? "text-sm" : "text-lg")}>
        {instance.pointsEarned > 0 ? instance.pointsEarned : activity.basePoints}{" "}
        <span className="font-medium text-neutral-500">pts</span>
      </p>

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
              <button
                disabled={pending || instance.progress <= 0}
                onClick={() => fire("decrement")}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border border-white/10 bg-neutral-800 text-neutral-200 transition-colors hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-40",
                  compact ? "h-7 w-7" : "h-8 w-8",
                )}
                aria-label="Decrease"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                disabled={pending}
                onClick={() => fire("increment")}
                className={cn(
                  "inline-flex flex-1 items-center justify-center rounded-lg border border-white/10 bg-neutral-800 text-neutral-200 transition-colors hover:bg-neutral-700 disabled:pointer-events-none",
                  compact ? "h-7 text-xs" : "h-8",
                )}
                aria-label="Increase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </>
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
              <button
                disabled={pending}
                onClick={() => fire(instance.sessionStart ? "stop" : "start")}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700 disabled:pointer-events-none",
                  compact ? "h-7 text-xs" : "h-8",
                )}
              >
                {instance.sessionStart ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Start
                  </>
                )}
              </button>
              <button
                disabled={pending || instance.durationSec <= 0 && !instance.sessionStart}
                onClick={() => fire("complete")}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg bg-neutral-100 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-40",
                  compact ? "h-7 px-2.5 text-xs" : "h-8 px-3",
                )}
              >
                Done
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
