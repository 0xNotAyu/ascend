"use client";

import * as React from "react";
import { Check, Plus, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity } from "@/types/activities.types";
import { WeeklyActivities } from "@/components/activity/weekly-activities";
import { ActivityCard } from "@/components/activity/activity-card";
import ProgressBar from "@/components/progress-bar";



// Shared button styles ------------------------------------------------
// One quiet outline pill for secondary actions, one solid light pill
// for the primary action. Every button in this file borrows one of the
// two so the whole surface reads as a single, deliberate system —
// mirrors "Calculate" / "Add" in the reference toolbar.

const secondaryButton =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800 px-4 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700";

const primaryButton =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-white";

// ---------- Activity Card ----------
// One activity: name, category, point value, and a way to start it.
// Reused both in the main row and inside the weekly dialog's 3x3 grid
// (via `size="compact"`), so it's the single source of truth for how
// an activity looks.







// ---------- Dashboard ----------

const tabs = ["all", "Career", "Workout", "improvement"];

const initialWeeklyActivities: Activity[] = [
  { id: "w1", name: "Morning Run", category: "Workout", points: 100 },
  { id: "w2", name: "Read 20 Pages", category: "Improvement", points: 100 },
  { id: "w3", name: "Update Resume", category: "Career", points: 100 },
  { id: "w4", name: "Cold Shower", category: "Workout", points: 100 },
  { id: "w5", name: "Journal Entry", category: "Improvement", points: 100 },
  { id: "w6", name: "Mock Interview", category: "Career", points: 100 },
  { id: "w7", name: "Stretch Routine", category: "Workout", points: 100 },
  { id: "w8", name: "Learn New Word", category: "Improvement", points: 100 },
  { id: "w9", name: "Network Outreach", category: "Career", points: 100 },
];

const initialTodayActivities: Activity[] = [
  { id: "t1", name: "Activity name", category: "CATEGORY", points: 100 },
  { id: "t2", name: "Activity name", category: "CATEGORY", points: 100 },
  { id: "t3", name: "Activity name", category: "CATEGORY", points: 100 },
];

const initialChips = [
  { id: "week", label: "This week" },
  { id: "today", label: "Today" },
];

export default function WeeklyDashboard() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [chips, setChips] = React.useState(initialChips);
  const [weeklyActivities, setWeeklyActivities] = React.useState(
    initialWeeklyActivities,
  );
  const [todayActivities, setTodayActivities] = React.useState(
    initialTodayActivities,
  );

  const toggleWeekly = (id: string) =>
    setWeeklyActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    );

  const toggleToday = (id: string) =>
    setTodayActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    );

  const removeChip = (id: string) =>
    setChips((prev) => prev.filter((c) => c.id !== id));

  // remove: const todayPoints = 700;

const todayPoints = React.useMemo(
  () =>
    todayActivities
      .filter((a) => a.done)
      .reduce((sum, a) => sum + a.points, 0),
  [todayActivities],
);
  const todayGoal = 300;
  const todayProgress = Math.min(
    100,
    Math.round((todayPoints / todayGoal) * 100),
  );

  return (
    // Staging backdrop only — this gray canvas is how the reference shot frames
    // the component, it isn't part of the design system / theme tokens.
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-800 p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-neutral-900 p-6 ">
        {/* Top row: breadcrumb + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-neutral-500">Dashboard</span>
            <span className="text-neutral-600">/</span>
            <span className="font-semibold text-white">Today</span>
            <span className="text-neutral-500">{todayPoints} pts</span>
          </div>

          <div className="flex items-center gap-2">
            <button className={secondaryButton}>Recalculate</button>
            <button className={primaryButton}>
              <Plus className="h-4 w-4" />
              Add Activity
            </button>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
          Activities
        </h1>

        {/* Bottom row: filter tabs + chips + filter button */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* Filter tabs segmented control */}
          <div className="flex items-center gap-1 rounded-lg bg-neutral-800/70 p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-500 hover:text-neutral-300",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* {chips.length > 0 && <div className="h-6 w-px bg-white/10" />} */}

          {/* Filter chips */}
          {/* <div className="flex items-center gap-2">
            {chips.map((chip) => (
              <span
                key={chip.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-normal text-neutral-200"
              >
                {chip.label}
                <button
                  onClick={() => removeChip(chip.id)}
                  className="rounded-full text-neutral-500 transition-colors hover:text-neutral-200"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div> */}

          <div className="h-6 w-px bg-white/10" />

          <button className={secondaryButton}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>

        {/* Progress Today */}
<ProgressBar
  layout="inline"
  value={todayPoints}
  max={todayGoal}
  label="Progress"
  sublabel="Today"
  showValue
  valueFormat={(v) => `${v} pts`}
  className="mt-5 rounded-xl border border-white/5 bg-neutral-800/60 px-5 py-4"
/>

        {/* Weekly Activities + this week's Activity cards */}
        <div className="mt-4 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4">
          <div className="h-72">
            <WeeklyActivities
              activities={weeklyActivities}
              onToggle={toggleWeekly}
            />
          </div>
          {todayActivities.map((activity) => (
            <div key={activity.id} className="h-72">
              <ActivityCard activity={activity} onGo={toggleToday} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
