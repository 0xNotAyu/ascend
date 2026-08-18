"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { addDays } from "date-fns";

import { cn } from "@/lib/utils";
import { ActivitySummary, getActivityState } from "@/types/activities.types";
import { PlanActivityCard } from "@/components/activity/plan-activity-card";
import { PlanForm } from "./plan-form";

const searchInputClass =
  "h-9 w-full rounded-lg border border-white/5 bg-neutral-800/60 pl-9 pr-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20";
const primaryButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-50 disabled:pointer-events-none";

// UTC midnight tomorrow — matches the UTC day boundaries already used
// by lib/date-utils.ts for "today"/"this week" (see PRD §7).
function tomorrowUTC(): Date {
  const d = addDays(new Date(), 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
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
    <div className="space-y-6 p-6">
      {/* Header row: search (wide) + Create (single primary action) */}
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
          className={cn(primaryButton, "shrink-0")}
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

      {/* Queue rail — absent entirely when nothing is queued (§5) */}
      {queued.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">Queued for tomorrow</p>
            <span className="text-sm text-neutral-500">({queued.length})</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {queued.map((activity) => (
              <PlanActivityCard
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
        </div>
      )}

      {/* Grid — every non-archived activity, regardless of state (§3) */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">All activities</p>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-neutral-800" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 text-center">
            <p className="text-sm font-semibold text-white">
              {query ? "No matches" : "Nothing here yet"}
            </p>
            <p className="text-sm text-neutral-500">
              {query
                ? "Try a different search."
                : "Create an activity to start holding onto it."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((activity) => (
              <PlanActivityCard
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

      {/* Create/Edit overlay — modal, not a page nav (§5). Matches
          design-system §9 Dialog surface: rounded-2xl border-white/5
          bg-neutral-900 shadow-2xl shadow-black/50, scrim bg-black/60. */}
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
    </div>
  );
}