"use client";

import * as React from "react";
import { Plus, SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActivityList } from "@/components/activity/activity-list";
import { WeeklyActivities } from "@/components/activity/weekly-activities";
import ProgressBar from "@/components/progress-bar";
import { LifeArea, Tag, TodayInstance } from "@/types/activities.types";
import { useRouter } from "next/navigation";

const secondaryButton =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800 px-4 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700";
const primaryButton =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-white";

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
  const router = useRouter();

  const [instances, setInstances] = React.useState<TodayInstance[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [history, setHistory] = React.useState<DayBucket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [lifeAreaFilter, setLifeAreaFilter] = React.useState<LifeArea | "all">("all");
  const [tagFilter, setTagFilter] = React.useState<string[]>([]);
  const [showTagPicker, setShowTagPicker] = React.useState(false);

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
      const tagsData = tagsRes.ok ? await tagsRes.json() : { tags: [] };
      const historyData = historyRes.ok ? await historyRes.json() : { days: [] };

      setInstances(instancesData.instances ?? []);
      setTags(tagsData.tags ?? []);
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

  const toggleTag = (id: string) =>
    setTagFilter((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const filtered = instances.filter((i) => {
    if (lifeAreaFilter !== "all" && i.activity.lifeArea !== lifeAreaFilter) return false;
    if (tagFilter.length > 0 && !i.activity.tagIds.some((t) => tagFilter.includes(t))) return false;
    return true;
  });

  const todayPoints = instances.reduce((sum, i) => sum + i.pointsEarned, 0);
  const todayGoal = instances.reduce((sum, i) => sum + i.activity.basePoints, 0) || 1;
  const allDoneToday = instances.length > 0 && instances.every((i) => i.status === "COMPLETED");

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-800 p-6">
      <div className="w-full max-w-5xl rounded-3xl bg-neutral-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-neutral-500">Dashboard</span>
            <span className="text-neutral-600">/</span>
            <span className="font-semibold text-white">Today</span>
            <span className="text-neutral-500">{todayPoints} pts</span>
          </div>

          <div className="flex items-center gap-2">
            <button className={secondaryButton} onClick={load}>
              Refresh
            </button>
            <button className={primaryButton} onClick={() => router.push("/plan")}>
              <Plus className="h-4 w-4" />
              Add Activity
            </button>
          </div>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Activities</h1>

        {error && (
          <div className="mt-4 rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-neutral-800/70 p-1">
            <button
              onClick={() => setLifeAreaFilter("all")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                lifeAreaFilter === "all"
                  ? "bg-neutral-700 text-white"
                  : "text-neutral-500 hover:text-neutral-300",
              )}
            >
              all
            </button>
            {LIFE_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setLifeAreaFilter(area)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  lifeAreaFilter === area
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-500 hover:text-neutral-300",
                )}
              >
                {LIFE_AREA_LABEL[area]}
              </button>
            ))}
          </div>

          {tagFilter.length > 0 && (
            <div className="flex items-center gap-2">
              {tagFilter.map((id) => {
                const tag = tags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-normal text-neutral-200"
                  >
                    {tag.name}
                    <button
                      onClick={() => toggleTag(id)}
                      className="rounded-full text-neutral-500 transition-colors hover:text-neutral-200"
                      aria-label={`Remove ${tag.name} filter`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div className="h-6 w-px bg-white/10" />

          <div className="relative">
            <button className={secondaryButton} onClick={() => setShowTagPicker((v) => !v)}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter by tag
            </button>
            {showTagPicker && (
              <div className="absolute left-0 top-10 z-10 w-48 rounded-xl border border-white/10 bg-neutral-900 p-2 shadow-2xl shadow-black/50">
                {tags.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-neutral-500">No tags yet</p>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white",
                        tagFilter.includes(tag.id) && "bg-neutral-800 text-white",
                      )}
                    >
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

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

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_2fr]">
          <div className="h-72">
            <WeeklyActivities days={history} />
          </div>
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
