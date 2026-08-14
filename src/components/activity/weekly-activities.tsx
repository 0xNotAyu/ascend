"use client";

// ---------- Weekly Activities (read-only, v1) ----------
// Scoped per PRD §5.1: shows the past 7 days' completion dots only.
// No interaction here yet — that's parked for v2 (see PRD §9).

import * as React from "react";

interface DayBucket {
  date: string;
  completed: number;
  total: number;
}

const WEEKDAY_LABEL = ["S", "M", "T", "W", "T", "F", "S"];

export function WeeklyActivities({ days }: { days: DayBucket[] }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-white/5 bg-neutral-800/60 p-4">
      <p className="text-sm font-semibold text-white">Last 7 days</p>

      <div className="my-3 flex flex-1 items-center justify-center gap-3">
        {days.map((day) => {
          const hasActivity = day.total > 0;
          const allDone = hasActivity && day.completed === day.total;
          const someDone = hasActivity && day.completed > 0 && !allDone;
          const dateObj = new Date(day.date + "T00:00:00Z");

          return (
            <div key={day.date} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium uppercase text-neutral-500">
                {WEEKDAY_LABEL[dateObj.getUTCDay()]}
              </span>
              <span
                title={hasActivity ? `${day.completed}/${day.total} completed` : "Nothing due"}
                className={
                  "h-2.5 w-2.5 rounded-full " +
                  (allDone
                    ? "bg-white"
                    : someDone
                      ? "bg-neutral-400"
                      : "bg-neutral-600")
                }
              />
            </div>
          );
        })}
      </div>

      <p className="text-[11px] font-medium text-neutral-500">
        Filled = everything due that day got done
      </p>
    </div>
  );
}
