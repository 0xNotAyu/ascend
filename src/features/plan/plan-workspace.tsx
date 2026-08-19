"use client";

import * as React from "react";
import { Layers, Plus, Search } from "lucide-react";
import { addDays } from "date-fns";

import { ActivitySummary, getActivityState } from "@/types/activities.types";
import { PlanActivityRow } from "@/components/activity/plan-activity-row";
import { PlanForm } from "./plan-form";

const searchInputClass =
  "h-9 w-full rounded-lg border border-white/5 bg-neutral-800/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20";
const primaryButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-50 disabled:pointer-events-none";

// UTC midnight tomorrow — matches the UTC day boundaries lib/date-utils.ts
// already uses for "today"/"this week" (see PRD §7).
function tomorrowUTC(): Date {
  const d = addDays(new Date(), 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800">
        <Search className="h-4 w-4 text-neutral-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">
          {query ? "No matches" : "Nothing here yet"}
        </p>
        <p className="text-sm text-neutral-500">
          {query ? "Try a different search." : "Create an activity to start holding onto it."}
        </p>
      </div>
    </div>
  );
}

export function PlanWorkspace() {
  const [activities, setActivities] = React.useState<ActivitySummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  // null = closed, "new" = create form, otherwise the activity being edited.
  const [editing, setEditing] = React.useState<ActivitySummary | "new" | null>(null);

  const loadActivities = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Failed to load activities");
      const data = await res.json();
      setActivities(data.activities ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  React.useEffect(() => {
    if (editing === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q),
    );
  }, [activities, query]);

  const queued = React.useMemo(
    () => activities.filter((a) => getActivityState(a) === "QUEUED"),
    [activities],
  );

  const patchActivity = async (id: string, body: Record<string, unknown>) => {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? (data.activity as ActivitySummary) : a)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPendingId(null);
    }
  };

  const handlePush = (activity: ActivitySummary) =>
    patchActivity(activity.id, { queuedFor: tomorrowUTC().toISOString() });

  const handleUnpush = (activity: ActivitySummary) =>
    patchActivity(activity.id, { queuedFor: null });

  const handleArchive = async (activity: ActivitySummary) => {
    setPendingId(activity.id);
    setError(null);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) throw new Error("Archive failed");
      setActivities((prev) => prev.filter((a) => a.id !== activity.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPendingId(null);
    }
  };

  const handleSaved = (activity: ActivitySummary) => {
    setActivities((prev) => {
      const exists = prev.some((a) => a.id === activity.id);
      return exists
        ? prev.map((a) => (a.id === activity.id ? activity : a))
        : [activity, ...prev];
    });
    setEditing(null);
  };

  return (
    <main className="h-screen overflow-hidden bg-neutral-800 p-6 pl-24">
    <div
      className="
        x-auto
        flex h-full w-full
        flex-col
        overflow-hidden
        rounded-3xl
        border border-white/5
        bg-neutral-900
        p-6
      "
    >
      {/* Outer page-level card — same shell as /today (rounded-3xl
          bg-neutral-900), so this page reads as part of the same app
          instead of a bare, full-bleed form. */}
      
        <div className="shrink-0 space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">Plan</h1>
          <p className="text-sm text-neutral-500">
            {loading
              ? "Loading…"
              : `${activities.length} ${activities.length === 1 ? "activity" : "activities"}` +
                (queued.length > 0 ? ` · ${queued.length} queued for tomorrow` : "")}
          </p>
        </div>

        {/* Search + Create row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              className={searchInputClass}
              placeholder="Search activities…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`${primaryButton} shrink-0`}
            onClick={() => setEditing("new")}
          >
            <Plus className="size-3.5" />
            Create
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Queue rail — a thin strip, absent entirely when nothing's queued */}
        {queued.length > 0 && (
          <div className="space-y-2.5 rounded-2xl border border-white/5 bg-neutral-800/40 p-3">
            <div className="flex items-center gap-2 px-1">
              <Layers className="h-3.5 w-3.5 text-neutral-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Queued for tomorrow
              </p>
              <span className="text-xs text-neutral-600">({queued.length})</span>
            </div>
            <div className="flex flex-wrap gap-2 px-1">
              {queued.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  disabled={pendingId === activity.id}
                  onClick={() => handleUnpush(activity)}
                  className="group inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-neutral-800 pl-3 pr-2.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-40"
                  title="Click to un-push"
                >
                  {activity.title}
                  <span className="text-neutral-500 transition-colors group-hover:text-neutral-200">
                    ×
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List view — every non-archived activity */}
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">All activities</p>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-800/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            // <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-neutral-800/60">
            //   {filtered.map((activity) => (
            //     <PlanActivityRow
            //       key={activity.id}
            //       activity={activity}
            //       onPush={handlePush}
            //       onUnpush={handleUnpush}
            //       onEdit={(a) => setEditing(a)}
            //       onArchive={handleArchive}
            //       pending={pendingId === activity.id}
            //     />
            //   ))}
            // </div>

            <div className="divide-y divide-white/[0.06]">
  {filtered.map((activity) => (
    <PlanActivityRow
      key={activity.id}
      activity={activity}
      onPush={handlePush}
      onUnpush={handleUnpush}
      onEdit={(a) => setEditing(a)}
      onArchive={handleArchive}
      pending={pendingId === activity.id}
    />
  ))}
</div>
        
          )}
          </div>
        </div>
      </div>

      {/* Create/Edit overlay */}
      {editing !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/5 bg-neutral-900 p-6 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <PlanForm
              key={editing === "new" ? "new" : editing.id}
              activity={editing === "new" ? null : editing}
              onSaved={handleSaved}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}