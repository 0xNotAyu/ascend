"use client";

import { CATEGORY, ui } from "@/lib/theme";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { UserSettings01Icon, DashboardSquare01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

type Category = "all" | "career" | "workout" | "improvement";

interface Quest {
  id: string;
  title: string;
  category: Exclude<Category, "all">;
  points: number;
  progress: number;
  total: number;
}

const quests: Quest[] = [
  { id: "1", title: "Deep work: ship one feature", category: "career", points: 100, progress: 0, total: 1 },
  { id: "2", title: "Update resume / portfolio", category: "career", points: 100, progress: 0, total: 1 },
  { id: "3", title: "30 min workout", category: "workout", points: 100, progress: 1, total: 1 },
  { id: "4", title: "10k steps", category: "workout", points: 50, progress: 0, total: 1 },
  { id: "5", title: "Write a journal entry", category: "improvement", points: 100, progress: 0, total: 1 },
  { id: "6", title: "Read 20 pages", category: "improvement", points: 50, progress: 0, total: 1 },
];

interface GoalTrial {
  id: string;
  title: string;
  progress: number;
  total: number;
  reward: string;
}

const goals: GoalTrial[] = [
  { id: "1", title: "Finish Ascend v1", progress: 3, total: 6, reward: "Unlock streak freeze" },
  { id: "2", title: "Land an internship", progress: 1, total: 5, reward: "Unlock weekly quests" },
];

const MILESTONES = [100, 200, 300, 400];
const MAX_ENGAGEMENT = 400;

export default function DashboardView() {
  const [filter, setFilter] = useState<Category>("all");

  const pointsToday = quests.reduce(
    (sum, q) => sum + (q.progress >= q.total ? q.points : 0),
    0
  );
  const visibleQuests = quests.filter(
    (q) => filter === "all" || q.category === filter
  );

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 p-8">
          {/* Profile header */}
          <div className={cn(ui.panel, "flex items-center gap-4")}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-mono text-lg font-semibold text-brand">
              12
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Level 12</span>
                <span className={cn(ui.caption, "font-mono")}>5,420 / 8,000 XP</span>
              </div>
              <div className={cn(ui.progressTrackThin, "mt-2")}>
                <div className={ui.progressFill} style={{ width: "68%" }} />
              </div>
            </div>
            <button className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <HugeiconsIcon icon={UserSettings01Icon} size={14} />
              Account
            </button>
          </div>

          {/* Today's engagement */}
          <div className={ui.panel}>
            <div className="mb-4 flex items-center justify-between">
              <span className={ui.sectionLabel}>Today&apos;s Engagement</span>
              <span className={cn(ui.mono, "text-sm")}>
                {pointsToday}
                <span className="text-muted-foreground"> / {MAX_ENGAGEMENT}</span>
              </span>
            </div>
            <div className={ui.progressTrack}>
              <div
                className={ui.progressFill}
                style={{ width: `${Math.min(100, (pointsToday / MAX_ENGAGEMENT) * 100)}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between">
              {MILESTONES.map((m) => {
                const reached = pointsToday >= m;
                return (
                  <div key={m} className="flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full border-2",
                        reached ? "border-brand bg-brand" : "border-border bg-background"
                      )}
                    />
                    <span className="font-mono text-[10px] text-muted-foreground">{m}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quests */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FilterPill
                label="All"
                icon={DashboardSquare01Icon}
                active={filter === "all"}
                onClick={() => setFilter("all")}
              />
              {(Object.keys(CATEGORY) as Array<keyof typeof CATEGORY>).map((key) => (
                <FilterPill
                  key={key}
                  label={CATEGORY[key].label}
                  icon={CATEGORY[key].icon}
                  active={filter === key}
                  onClick={() => setFilter(key)}
                  activeClass={cn(CATEGORY[key].bg, CATEGORY[key].text)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          </div>

          {/* Long-term goals */}
          <div className="space-y-4">
            <span className={ui.sectionLabel}>Long-Term Goals</span>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className={ui.panelTight}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className={cn(ui.caption, "font-mono")}>
                      {goal.progress}/{goal.total}
                    </span>
                  </div>
                  <div className={ui.progressTrackThin}>
                    <div
                      className={ui.progressFill}
                      style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                    />
                  </div>
                  <div className={cn(ui.caption, "mt-2.5")}>Reward: {goal.reward}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  icon,
  active,
  onClick,
  activeClass,
}: {
  label: string;
  icon: IconSvgElement;
  active: boolean;
  onClick: () => void;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
        active && cn("border-transparent", activeClass ?? "bg-accent text-accent-foreground")
      )}
    >
      <HugeiconsIcon icon={icon} size={13} />
      {label}
    </button>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  const meta = CATEGORY[quest.category];
  const done = quest.progress >= quest.total;

  return (
    <div className={cn(ui.panelTight, "flex flex-col gap-3")}>
      <div className="flex items-center justify-between">
        <span className={cn(ui.pill, meta.bg, meta.text)}>
          <HugeiconsIcon icon={meta.icon} size={12} />
          {meta.label}
        </span>
        <span className={ui.mono}>+{quest.points}</span>
      </div>

      <span className="text-[14px] font-medium leading-snug">{quest.title}</span>

      {quest.total > 1 ? (
        <div className={ui.progressTrack}>
          <div
            className={cn("h-full rounded-full transition-all", meta.bar)}
            style={{ width: `${(quest.progress / quest.total) * 100}%` }}
          />
        </div>
      ) : null}

      <button
        disabled={done}
        className={cn(
          "mt-1 h-8 rounded-xl text-xs font-medium transition-colors",
          done
            ? "cursor-default bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground hover:opacity-90"
        )}
      >
        {done ? "Done" : "Go"}
      </button>
    </div>
  );
}