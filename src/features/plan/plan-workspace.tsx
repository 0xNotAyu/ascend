"use client";

import * as React from "react";
import { Pencil, Plus, CornerRightUp, Search, Trash2 } from "lucide-react";
import { addDays } from "date-fns";

import { ActivitySummary, getActivityState } from "@/types/activities.types";
import { PlanForm } from "./plan-form";

const primaryButton =
  "inline-flex h-8 items-center justify-center gap-1 rounded-md bg-neutral-100 px-3 text-xs font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-50 disabled:pointer-events-none";

// --- Life aspects -----------------------------------------------------
// Fixed, known set — not derived from data, so there's no more
// "Uncategorized" bucket. Change field name in `categoryOf` below if
// your ActivitySummary type calls this something other than `category`.
const CATEGORIES = ["Health", "Career", "Personal", "Finance", "Relationships", "Other"] as const;
type Category = (typeof CATEGORIES)[number];

function categoryOf(a: ActivitySummary): Category {
  const raw = (a as ActivitySummary & { category?: string }).category;
  const match = CATEGORIES.find((c) => c.toLowerCase() === raw?.toLowerCase());
  return match ?? "Other";
}

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
        <p className="text-sm  text-white">
          {query ? "No matches" : "Nothing here yet"}
        </p>
        <p className="text-sm text-neutral-500">
          {query ? "Try a different search." : "Create an activity to start holding onto it."}
        </p>
      </div>
    </div>
  );
}

// Plain text tabs, no counts, no pills — just weight/color state,
// matching the reference: All · Health · Career · Personal · Finance ·
// Relationships · Other.
function CategoryTabs({
  active,
  onChange,
}: {
  active: Category | null;
  onChange: (category: Category | null) => void;
}) {
  return (
    <div className="flex items-center gap-6">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`text-sm transition-colors ${
          active === null ? " text-white" : "text-neutral-500 hover:text-neutral-300"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`text-sm transition-colors ${
            active === c ? " text-white" : " text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

// Shared grid template so the header and every row line up as real
// table columns. Add a column here (e.g. "minmax(0,1fr)_140px_120px_...")
// when Tags/Date land — everything else keeps working unchanged.
const ROW_GRID = "grid grid-cols-[minmax(0,1fr)_70px_104px] items-center gap-4";


function ActivityRow({
  activity,
  pending,
  onEdit,
  onPush,
  onUnpush,
  onDelete,
}: {
  activity: ActivitySummary;
  pending: boolean;
  onEdit: (a: ActivitySummary) => void;
  onPush: (a: ActivitySummary) => void;
  onUnpush: (a: ActivitySummary) => void;
  onDelete: (a: ActivitySummary) => void;
}) {
  const isQueued = getActivityState(activity) === "QUEUED";

  return (
    <div className={`${ROW_GRID} group border-b border-white/5 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-white/[0.03]`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="truncate text-sm  text-white">{activity.title}</span>
        {activity.description && (
          <span className="truncate text-sm text-neutral-500">{activity.description}</span>
        )}
      </div>

      <span className="text-right text-sm text-neutral-400">
       
      </span>

      <div className="flex shrink-0 items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 has-[[data-active=true]]:opacity-100">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete "${activity.title}"? This can't be undone.`)) {
              onDelete(activity);
            }
          }}
          disabled={pending}
          title="Delete"
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:pointer-events-none disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(activity)}
          disabled={pending}
          title="Edit"
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-200 disabled:pointer-events-none disabled:opacity-40"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          data-active={isQueued}
          onClick={() => (isQueued ? onUnpush(activity) : onPush(activity))}
          disabled={pending}
          title={isQueued ? "Queued for tomorrow — click to remove" : "Push to tomorrow's board"}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-40 ${
            isQueued
              ? "bg-neutral-100 text-neutral-900 hover:bg-white"
              : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"
          }`}
        >
          <CornerRightUp  className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function PlanWorkspace() {
  const [activities, setActivities] = React.useState<ActivitySummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [category, setCategory] = React.useState<Category | null>(null);
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
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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
    return activities.filter((a) => {
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q);
      const matchesCategory = !category || categoryOf(a) === category;
      return matchesQuery && matchesCategory;
    });
  }, [activities, query, category]);

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

  const handleDelete = async (activity: ActivitySummary) => {
    setPendingId(activity.id);
    setError(null);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setActivities((prev) => prev.filter((a) => a.id !== activity.id));
      if (editing !== "new" && editing?.id === activity.id) setEditing(null);
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
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 p-6">
        {/* Header */}
        <div className="shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl tracking-tight text-white">Plan</h1>

            <div
              className={`relative flex h-9 items-center overflow-hidden rounded-lg transition-all duration-200 ease-out ${
                searchOpen
                  ? "w-56 border border-white/5 bg-neutral-800/60"
                  : "w-9 border border-transparent bg-transparent"
              }`}
            >
              <button
                type="button"
                onClick={() => !searchOpen && setSearchOpen(true)}
                title="Search"
                tabIndex={searchOpen ? -1 : 0}
                className="absolute left-0 top-0 flex h-9 w-9 shrink-0 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-200"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                ref={searchInputRef}
                className={`h-9 w-full bg-transparent pl-9 pr-3 text-sm text-neutral-200 outline-none placeholder:text-neutral-500 transition-opacity duration-150 ${
                  searchOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                placeholder="Search activities…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    setSearchOpen(false);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                onBlur={() => {
                  if (!query) setSearchOpen(false);
                }}
              />
            </div>
          </div>

          <p className="mt-1.5 text-sm text-neutral-500">
            {loading
              ? "Loading…"
              : `${activities.length} ${activities.length === 1 ? "activity" : "activities"}` +
                (queued.length > 0 ? ` · ${queued.length} queued for tomorrow` : "")}
          </p>
        </div>

        {/* Life-aspect filter + create, same row */}
        <div className="mt-6 flex shrink-0 items-center justify-between pb-4">
          <CategoryTabs active={category} onChange={setCategory} />
          <button
            type="button"
            className={`${primaryButton} shrink-0`}
            onClick={() => setEditing("new")}
          >
            <Plus className="size-3" />
            Create
          </button>
        </div>

        {error && (
          <div className="mt-5 shrink-0 rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Queue rail — a thin strip, absent entirely when nothing's queued */}
        {queued.length > 0 && (
          <div className="mt-5 shrink-0 flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-neutral-800/40 p-3">
            <span className="px-1 text-xs uppercase tracking-wide text-neutral-400">
              Queued for tomorrow
            </span>
            {queued.map((activity) => (
              <button
                key={activity.id}
                type="button"
                disabled={pendingId === activity.id}
                onClick={() => handleUnpush(activity)}
                className="group inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-neutral-800 pl-3 pr-2.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 disabled:pointer-events-none disabled:opacity-40"
                title="Click to un-push"
              >
                {activity.title}
                <span className="text-neutral-500 transition-colors group-hover:text-neutral-200">×</span>
              </button>
            ))}
          </div>
        )}

        {/* List — Notion-style rows: colored dot, title, category tag, description */}
        <div className="mt-0 min-h-0 flex-1 overflow-y-auto">
          {!loading && filtered.length !== activities.length && (
            <p className="px-1 pb-2 text-xs text-neutral-500">
              Showing {filtered.length} of {activities.length}
            </p>
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-800/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <div>
            
              {filtered.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  pending={pendingId === activity.id}
                  onEdit={(a) => setEditing(a)}
                  onPush={handlePush}
                  onUnpush={handleUnpush}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit overlay */}
      {editing !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/5 bg-neutral-900 p-6 shadow-2xl shadow-black/50"
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