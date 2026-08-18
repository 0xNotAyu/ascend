"use client";

import * as React from "react";


import { cn } from "@/lib/utils";
import { ActivityList } from "@/components/activity/activity-list";
// import { WeeklyActivities } from "@/components/activity/weekly-activities";
import ProgressBar from "@/components/progress-bar";
import { LifeArea, TodayInstance } from "@/types/activities.types";



const LIFE_AREAS: LifeArea[] = [
  "HEALTH",
  "CAREER",
  "PERSONAL",
  "FINANCE",
  "RELATIONSHIPS",
  "OTHER",
];
const LIFE_AREA_LABEL: Record<LifeArea, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  PERSONAL: "Personal",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  OTHER: "Other",
};

interface DayBucket {
  date: string;
  completed: number;
  total: number;
}

export default function WeeklyDashboard() {


  const [instances, setInstances] = React.useState<TodayInstance[]>([]);

  const [history, setHistory] = React.useState<DayBucket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [lifeAreaFilter, setLifeAreaFilter] = React.useState<LifeArea | "all">("all");


  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [instancesRes, tagsRes, historyRes] = await Promise.all([
        fetch("/api/instances/today"),
        fetch("/api/tags"),
        fetch("/api/instances/history?days=7"),
      ]);
      if (!instancesRes.ok) throw new Error("Failed to load today's activities");
      const instancesData = await instancesRes.json();
  
      const historyData = historyRes.ok ? await historyRes.json() : { days: [] };

      setInstances(instancesData.instances ?? []);

      setHistory(historyData.days ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (
    instanceId: string,
    action: string,
    extra?: Record<string, unknown>,
  ) => {
    // Optimistic-ish: just refetch the single source of truth after the
    // PATCH resolves. Simpler and safer than hand-rolling local state
    // transitions that could drift from server logic (esp. TOGGLE timers).
    const res = await fetch(`/api/instances/${instanceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "That action failed");
      return;
    }
    const data = await res.json();
    setInstances((prev) =>
      prev.map((i) => (i.id === instanceId ? { ...i, ...data.instance } : i)),
    );
  };


  const filtered = instances.filter(
  (i) =>
    lifeAreaFilter === "all" ||
    i.activity.lifeArea === lifeAreaFilter
);

  const todayPoints = instances.reduce((sum, i) => sum + i.pointsEarned, 0);
  const todayGoal = instances.reduce((sum, i) => sum + i.activity.basePoints, 0) || 1;
  const allDoneToday = instances.length > 0 && instances.every((i) => i.status === "COMPLETED");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-800 p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-neutral-900 p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold tracking-tight text-white">
      {new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </h1>

    <p className="mt-1 text-sm text-neutral-500">
      {instances.filter((i) => i.status === "COMPLETED").length} of{" "}
      {instances.length} activities completed
    </p>
  </div>

  <div className="text-right">
    <div className="text-sm font-medium text-neutral-300">
      4 day streak
    </div>
  </div>
</div>

        {error && (
          <div className="mt-4 rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

<div className="mt-5 flex items-center gap-5">
  <button
    onClick={() => setLifeAreaFilter("all")}
    className={cn(
      "text-sm font-medium transition-colors",
      lifeAreaFilter === "all"
        ? "text-white"
        : "text-neutral-500 hover:text-neutral-300",
    )}
  >
    All
  </button>

  {LIFE_AREAS.map((area) => (
    <button
      key={area}
      onClick={() => setLifeAreaFilter(area)}
      className={cn(
        "text-sm font-medium transition-colors",
        lifeAreaFilter === area
          ? "text-white"
          : "text-neutral-500 hover:text-neutral-300",
      )}
    >
      {LIFE_AREA_LABEL[area]}
    </button>
  ))}
</div>

        <ProgressBar
          layout="inline"
          value={todayPoints}
          max={todayGoal}
          label="Progress"
          showValue
          valueFormat={(v) => `${v} pts`}
          className="mt-5 rounded-xl border border-white/5 bg-neutral-800/60 px-5 py-4"
        />

        <div className="mt-4 grid grid-cols-1 gap-4 ">
          {/* <div className="h-72">
            <WeeklyActivities days={history} />
          </div> */}
          <div className="min-h-72">
            {loading ? (
              <div className="flex h-72 items-center justify-center text-sm text-neutral-500">
                Loading…
              </div>
            ) : (
              <ActivityList
                instances={filtered}
                onAction={handleAction}
                emptyLabel={
                  instances.length === 0
                    ? "No activities yet"
                    : allDoneToday
                      ? "All done for today"
                      : "Nothing matches this filter"
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
