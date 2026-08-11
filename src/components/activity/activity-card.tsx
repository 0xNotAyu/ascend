import { cn } from "@/lib/utils";
import { ActivityCardProps } from "@/types/activities.types";
import { Check } from "lucide-react";

export function ActivityCard({
  activity,
  size = "default",
  onGo,
  className,
}: ActivityCardProps) {
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-xl border border-white/5 bg-neutral-800/60 transition-colors hover:bg-neutral-800/90",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <div className={compact ? "space-y-0.5" : "space-y-1"}>
        <p
          className={cn(
            "font-semibold text-white",
            compact ? "text-xs" : "text-base",
          )}
        >
          {activity.name}
        </p>
        <p
          className={cn(
            "font-medium uppercase tracking-wide text-neutral-500",
            compact ? "text-[8px]" : "text-[10px]",
          )}
        >
          {activity.category}
        </p>
      </div>

      <p
        className={cn(
          "font-semibold text-white",
          compact ? "text-sm" : "text-lg",
        )}
      >
        {activity.points}{" "}
        <span className="font-medium text-neutral-500">pts</span>
      </p>

      <button
        onClick={() => onGo?.(activity.id)}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-colors",
          compact ? "h-7 px-3 text-xs" : "h-8 px-4",
          activity.done
            ? "bg-neutral-800 text-neutral-500"
            : "border border-white/10 bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
        )}
      >
        {activity.done ? (
          <>
            <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            Done
          </>
        ) : (
          "GO"
        )}
      </button>
    </div>
  );
}