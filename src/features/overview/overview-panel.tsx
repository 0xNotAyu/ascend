"use client";

// Replaces overview-panel.tsx per the PRD's /overview → /logs restructure.
// UI only for now — every value below is mock data. Swap MOCK_* for real
// fetches to GET /api/logs/stats and GET /api/logs/feed once those exist,
// keeping the same shapes (CharacterSummary / StatSummary / etc).
//
// New dependency: `npm install recharts` if it isn't already in the project.

import * as React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// ---------- Types (mirror the PRD data model) ----------

type Rank = "B" | "A" | "S" | "S++";

interface CharacterSummary {
  rank: Rank;
  title: string;
  totalLevel: number;
}

interface StatSummary {
  id: string;
  name: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

interface MomentumPoint {
  date: string; // short label, e.g. "Mon"
  rate: number; // 0-100
}

interface LifeBalanceItem {
  label: string;
  value: number; // 0-100
}

interface HeatmapDay {
  date: string;
  intensity: 0 | 1 | 2 | 3 | 4;
}

type FeedEntryType = "completion" | "levelup" | "redemption" | "goal";

interface FeedEntry {
  id: string;
  type: FeedEntryType;
  title: string;
  subtitle?: string;
  timestamp: string; // ISO
}

// ---------- Mock data — delete once real endpoints are wired ----------

const MOCK_CHARACTER: CharacterSummary = { rank: "S", title: "the craftsman", totalLevel: 47 };

const MOCK_STATS: StatSummary[] = [
  { id: "vitality", name: "Vitality", level: 6, currentXP: 620, xpToNextLevel: 1000 },
  { id: "discipline", name: "Discipline", level: 5, currentXP: 210, xpToNextLevel: 700 },
  { id: "craft", name: "Craft", level: 9, currentXP: 1870, xpToNextLevel: 2200 },
  { id: "career", name: "Career", level: 4, currentXP: 340, xpToNextLevel: 600 },
  { id: "relationships", name: "Relationships", level: 5, currentXP: 480, xpToNextLevel: 700 },
];

const MOCK_MOMENTUM: MomentumPoint[] = [
  { date: "Mon", rate: 40 },
  { date: "Tue", rate: 55 },
  { date: "Wed", rate: 60 },
  { date: "Thu", rate: 50 },
  { date: "Fri", rate: 35 },
  { date: "Sat", rate: 45 },
  { date: "Sun", rate: 65 },
];

const MOCK_LIFE_BALANCE: LifeBalanceItem[] = [
  { label: "Health", value: 70 },
  { label: "Career", value: 55 },
  { label: "Personal", value: 40 },
  { label: "Craft", value: 85 },
];

const MOCK_HEATMAP: HeatmapDay[] = Array.from({ length: 28 }, (_, i) => ({
  date: `d${i}`,
  intensity: [0, 2, 1, 3, 0, 0, 4][i % 7] as HeatmapDay["intensity"],
}));

const MOCK_FEED: FeedEntry[] = [
  { id: "1", type: "levelup", title: "Craft reached level 9", timestamp: new Date().toISOString() },
  {
    id: "2",
    type: "completion",
    title: 'Completed "Morning run"',
    subtitle: "12 day streak",
    timestamp: new Date(Date.now() - 3600e3).toISOString(),
  },
  {
    id: "3",
    type: "redemption",
    title: 'Redeemed "Movie night"',
    subtitle: "-80g",
    timestamp: new Date(Date.now() - 7200e3).toISOString(),
  },
  {
    id: "4",
    type: "goal",
    title: 'Goal "Ship the plan page" hit 50%',
    timestamp: new Date(Date.now() - 86400e3).toISOString(),
  },
];

// ---------- Main panel ----------

type Tab = "stats" | "feed";

export function LogsPanel() {
  const [tab, setTab] = React.useState<Tab>("stats");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Logs</h1>
        <p className="text-sm text-neutral-500">Your progress, at your own pace.</p>
      </div>

      <div className="flex w-fit gap-1 rounded-full border border-white/5 bg-neutral-800/60 p-1">
        <TabButton active={tab === "stats"} onClick={() => setTab("stats")}>
          Stats
        </TabButton>
        <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>
          Feed
        </TabButton>
      </div>

      {tab === "stats" ? <StatsTab /> : <FeedTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-white text-neutral-900" : "text-neutral-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ---------- Stats tab ----------

function StatsTab() {
  return (
    <div className="space-y-4">
      <CharacterHeader character={MOCK_CHARACTER} />
      <StatRadar stats={MOCK_STATS} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MOCK_STATS.map((s) => (
          <StatCard key={s.id} stat={s} />
        ))}
      </div>

      <Panel title="Momentum" subtitle="rolling 7-day completion rate — a dip recovers, it doesn't reset">
        <MomentumChart data={MOCK_MOMENTUM} />
      </Panel>

      <Panel title="Life balance" subtitle="where your energy has gone this month">
        <LifeBalanceBars items={MOCK_LIFE_BALANCE} />
      </Panel>

      <Panel title="Consistency" subtitle="quiet days are just empty, never marked as missed">
        <ConsistencyHeatmap days={MOCK_HEATMAP} />
      </Panel>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-neutral-800/60 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function CharacterHeader({ character }: { character: CharacterSummary }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-neutral-800/60 p-4">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-xl font-semibold text-white">
        {character.rank}
      </div>
      <div>
        <p className="text-lg font-semibold text-white">
          Level {character.totalLevel} · {character.title}
        </p>
        <p className="text-xs text-neutral-500">rank {character.rank}</p>
      </div>
    </div>
  );
}

function StatRadar({ stats }: { stats: StatSummary[] }) {
  const data = stats.map((s) => ({
    name: s.name,
    // normalized 0-100 so stats on different XP curves still compare visually
    value: Math.round((s.currentXP / s.xpToNextLevel) * 100),
  }));

  return (
    <Panel title="Build" subtitle="your stats, as one shape">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: "#a3a3a3", fontSize: 12 }} />
            <Radar dataKey="value" stroke="#ffffff" fill="#ffffff" fillOpacity={0.12} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function StatCard({ stat }: { stat: StatSummary }) {
  const pct = Math.min(100, Math.round((stat.currentXP / stat.xpToNextLevel) * 100));
  return (
    <div className="rounded-xl border border-white/5 bg-neutral-800/60 p-3">
      <p className="text-sm font-medium text-white">{stat.name}</p>
      <p className="text-xs text-neutral-500">level {stat.level}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-700">
        <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-neutral-500">
        {stat.currentXP} / {stat.xpToNextLevel} xp
      </p>
    </div>
  );
}

function MomentumChart({ data }: { data: MomentumPoint[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis dataKey="date" tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "#171717",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a3a3a3" }}
            itemStyle={{ color: "#fff" }}
          />
          <Line type="monotone" dataKey="rate" stroke="#ffffff" strokeWidth={2} dot={{ r: 3, fill: "#ffffff" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function LifeBalanceBars({ items }: { items: LifeBalanceItem[] }) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
            <span>{item.label}</span>
            <span className="text-white">{item.value}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-700">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConsistencyHeatmap({ days }: { days: HeatmapDay[] }) {
  const opacity = [0, 0.15, 0.35, 0.55, 0.85];
  return (
    <div className="grid max-w-[240px] grid-cols-7 gap-1.5">
      {days.map((day) => (
        <div
          key={day.date}
          className="aspect-square rounded-[4px] border border-white/5"
          style={{
            background:
              day.intensity === 0 ? "rgba(255,255,255,0.03)" : `rgba(255,255,255,${opacity[day.intensity]})`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Feed tab ----------

function FeedTab() {
  if (MOCK_FEED.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-neutral-800/60 px-4 py-8 text-center text-sm text-neutral-500">
        Nothing logged yet — complete something on Today to start your story.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {MOCK_FEED.map((entry) => (
        <FeedRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

const FEED_ICON: Record<FeedEntryType, string> = {
  completion: "✓",
  levelup: "▲",
  redemption: "◆",
  goal: "★",
};

function FeedRow({ entry }: { entry: FeedEntry }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-neutral-800/60 px-4 py-3">
      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700 text-[11px] text-white">
        {FEED_ICON[entry.type]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{entry.title}</p>
        {entry.subtitle && <p className="text-xs text-neutral-500">{entry.subtitle}</p>}
      </div>
      <span className="flex-shrink-0 text-[11px] text-neutral-500">{relativeTime(entry.timestamp)}</span>
    </div>
  );
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}