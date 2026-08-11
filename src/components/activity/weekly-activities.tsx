// ---------- Weekly Activities ----------
// Holds the set of activities due this week. Collapsed view shows a
// "Recommended" teaser + refresh timer + "do weekly" button; that
// button opens a dialog with all of them laid out 3x3 in a square,
// next to a vertical progress bar tracking how many are done.

import { WeeklyActivitiesProps } from "@/types/activities.types";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ActivityCard } from "./activity-card";
import { cn } from "@/lib/utils";


// ---------- Vertical Progress ----------
// Used only inside the weekly dialog — separate from the horizontal
// bar in the main "Progress Today" row.

function VerticalProgress({ value }: { value: number }) {
  return (
    <div className="relative flex w-1.5 flex-col justify-end self-stretch rounded-full bg-neutral-800">
      <div
        className="w-full rounded-full bg-white transition-all"
        style={{ height: `${value}%` }}
      />
      <div
        className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-neutral-900 bg-white transition-all"
        style={{ bottom: `calc(${value}% - 6px)` }}
      />
    </div>
  );
}


export function WeeklyActivities({
  activities,
  onToggle,
  refreshLabel = "Refresh in 2d 4h",
}: WeeklyActivitiesProps) {
  const [open, setOpen] = React.useState(false);
  const doneCount = activities.filter((a) => a.done).length;
  const progress = Math.round((doneCount / activities.length) * 100);

  const secondaryButton =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800 px-4 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700";



  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-white/5 bg-neutral-800/60 p-4">
      <p className="text-sm font-semibold text-white">Weekly Activities</p>

      <button
        onClick={() => setOpen(true)}
        className="my-3 flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm font-medium text-neutral-500 transition-colors hover:border-white/20 hover:text-neutral-300"
      >
        Recommended
      </button>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-neutral-500">
          {refreshLabel}
        </span>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <button className={cn(secondaryButton, "h-8 px-4 text-xs")}>
                do weekly
              </button>
            }
          ></DialogTrigger>
          <DialogContent className="max-w-xl border-white/5 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="font-semibold text-white">
                Weekly Activities
              </DialogTitle>
            </DialogHeader>
            <div className="flex gap-4 pt-2">
              <VerticalProgress value={progress} />
              <div className="grid aspect-square flex-1 grid-cols-3 grid-rows-3 gap-3">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    size="compact"
                    onGo={onToggle}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}