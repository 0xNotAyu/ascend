"use client";

import * as React from "react";

interface TagPoints {
  tagId: string;
  name: string;
  points: number;
}

interface OverviewData {
  totalPointsAllTime: number;
  totalPointsThisWeek: number;
  completionRate7d: number;
  pointsByTag: TagPoints[];
}

export function OverviewPanel() {
  const [data, setData] = React.useState<OverviewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/stats/overview")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxTagPoints = data?.pointsByTag.reduce((m, t) => Math.max(m, t.points), 0) || 1;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
        <p className="text-sm text-neutral-500">How you&apos;ve been doing.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
          Loading…
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatTile label="All-time points" value={data.totalPointsAllTime} />
            <StatTile label="This week" value={data.totalPointsThisWeek} />
            <StatTile label="7-day completion" value={`${data.completionRate7d}%`} />
          </div>

          <div className="rounded-xl border border-white/5 bg-neutral-800/60 p-4">
            <p className="text-sm font-semibold text-white">Points by tag</p>
            {data.pointsByTag.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">
                Nothing tagged yet — complete a tagged activity to see it here.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {data.pointsByTag.map((tag) => (
                  <div key={tag.tagId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
                      <span>{tag.name}</span>
                      <span className="text-white">{tag.points} pts</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-700">
                      <div
                        className="h-full rounded-full bg-white transition-all"
                        style={{ width: `${(tag.points / maxTagPoints) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/5 bg-neutral-800/60 p-4">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-neutral-500">{label}</p>
    </div>
  );
}
