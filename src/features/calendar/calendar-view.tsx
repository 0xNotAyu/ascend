"use client";

import * as React from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------
// Same system as the dashboard/sidebar: neutral-900 panel on a
// neutral-700 stage, neutral-800(/60) for nested surfaces, hairline
// white/10-5 borders, white for emphasis, neutral-500 for muted text.
// Emerald marks "today" (the one live/status moment on a calendar);
// red is reserved for an overdue deadline — nothing else gets color.
// ---------------------------------------------------------------------

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type Tag = "personal" | "work" | "travel" | "reminder";

export interface CalendarEvent {
  id: string;
  day: number;
  endDay?: number;
  label: string;
  tag: Tag;
  hasAttachment?: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  day: number;
  tag: Tag;
  urgent?: boolean;
}

// Category is conveyed by dot fill/outline, never by hue.
const tagDot: Record<Tag, string> = {
  personal: "bg-white",
  work: "border border-neutral-400 bg-transparent",
  travel: "bg-neutral-400",
  reminder: "bg-neutral-600",
};

const events: CalendarEvent[] = [
  {
    id: "e1",
    day: 4,
    label: "Studio session",
    tag: "personal",
    hasAttachment: true,
  },
  { id: "e2", day: 5, label: "Team sync", tag: "work" },
  { id: "e3", day: 7, label: "Pilates", tag: "personal" },
  { id: "e4", day: 10, label: "Public holiday", tag: "reminder" },
  { id: "e5", day: 11, label: "Pilates", tag: "personal" },
  { id: "e6", day: 12, label: "Nail appointment", tag: "personal" },
  { id: "e7", day: 13, label: "Pilates", tag: "personal" },
  { id: "e8", day: 14, label: "Design review", tag: "work" },
  { id: "e9", day: 15, label: "Nail appointment", tag: "personal" },
  {
    id: "e10",
    day: 16,
    label: "Sunburst shoot",
    tag: "personal",
    hasAttachment: true,
  },
  { id: "e11", day: 17, endDay: 20, label: "Korea trip", tag: "travel" },
  {
    id: "e12",
    day: 22,
    endDay: 23,
    label: "Tokyo",
    tag: "travel",
    hasAttachment: true,
  },
  { id: "e13", day: 25, label: "Pilates", tag: "personal" },
  {
    id: "e14",
    day: 26,
    label: "Studio session",
    tag: "personal",
    hasAttachment: true,
  },
  { id: "e15", day: 27, label: "Credit card due", tag: "reminder" },
];

const deadlines: Deadline[] = [
  { id: "d1", title: "Rent payment", day: 13, tag: "reminder" },
  { id: "d2", title: "Client deliverable", day: 14, tag: "work", urgent: true },
  { id: "d3", title: "Passport renewal", day: 20, tag: "reminder" },
  { id: "d4", title: "Flight check-in — Tokyo", day: 22, tag: "travel" },
  { id: "d5", title: "Credit card statement", day: 27, tag: "reminder" },
];

// ---------- Month grid ----------

function getMonthGrid(year: number, monthIndex: number) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-start

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ---------- Day cell ----------

interface DayCellProps {
  day: number | null;
  monthEvents: CalendarEvent[];
  isToday: boolean;
}

function DayCell({ day, monthEvents, isToday }: DayCellProps) {
  if (day === null) {
    return <div className="min-h-[92px] rounded-lg" />;
  }

  const singleEvents = monthEvents.filter((e) => e.day === day && !e.endDay);
  const range = monthEvents.find(
    (e) => e.endDay !== undefined && day >= e.day && day <= e.endDay,
  );
  const isRangeStart = range?.day === day;
  const isRangeEnd = range?.endDay === day;
  const hasAttachment = monthEvents.some(
    (e) => e.day === day && e.hasAttachment,
  );

  return (
    <div
      className={cn(
        "flex min-h-[92px] flex-col gap-1.5 rounded-lg border p-2 transition-colors",
        isToday
          ? "border-emerald-500/30 bg-neutral-800/80"
          : "border-white/5 bg-neutral-800/40 hover:bg-neutral-800/60",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sm font-medium",
            isToday ? "text-emerald-400" : "text-neutral-300",
          )}
        >
          {day}
        </span>
        {hasAttachment && (
          <Paperclip className="h-3 w-3 text-neutral-600" strokeWidth={1.8} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {singleEvents.slice(0, 3).map((e) => (
          <div key={e.id} className="flex items-center gap-1.5 overflow-hidden">
            <span
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tagDot[e.tag])}
            />
            <span className="truncate text-[11px] text-neutral-400">
              {e.label}
            </span>
          </div>
        ))}
        {singleEvents.length > 3 && (
          <span className="text-[10px] text-neutral-600">
            +{singleEvents.length - 3} more
          </span>
        )}
      </div>

      {range && (
        <div
          className={cn(
            "mt-auto flex h-5 items-center gap-1 rounded-md bg-neutral-700/60 px-1.5 text-[10px] font-medium text-neutral-300",
            !isRangeStart && "justify-center",
          )}
        >
          {isRangeStart ? (
            <span className="truncate">{range.label}</span>
          ) : (
            <span className="h-px w-full bg-neutral-500/40" />
          )}
          {isRangeEnd && (
            <ArrowRight className="h-3 w-3 shrink-0 text-neutral-500" />
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Month rail ----------

interface MonthRailProps {
  activeMonth: number;
  onSelect: (index: number) => void;
}

function MonthRail({ activeMonth, onSelect }: MonthRailProps) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-white/5 pr-3">
      {months.map((m, i) => (
        <button
          key={m}
          onClick={() => onSelect(i)}
          className={cn(
            "flex h-7 w-12 items-center justify-center rounded-md text-xs font-medium transition-colors",
            i === activeMonth
              ? "bg-neutral-800 text-white"
              : "text-neutral-500 hover:text-neutral-300",
          )}
        >
          {m.slice(0, 3).toLowerCase()}
        </button>
      ))}
    </div>
  );
}

// ---------- Upcoming panel ----------

interface UpcomingPanelProps {
  items: Deadline[];
  monthLabel: string;
}

function UpcomingPanel({ items, monthLabel }: UpcomingPanelProps) {
  const sorted = [...items].sort((a, b) => a.day - b.day);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-white/5 bg-neutral-900 p-4">
      <p className="text-sm font-semibold text-white">Upcoming</p>
      <p className="mb-3 text-xs text-neutral-500">
        Deadlines &amp; events this month
      </p>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {sorted.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-800/60"
          >
            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-white/5 bg-neutral-800/60">
              <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-500">
                {monthLabel.slice(0, 3)}
              </span>
              <span className="text-xs font-semibold text-white">{d.day}</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {d.title}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", tagDot[d.tag])}
                />
                <span
                  className={cn(
                    "text-xs",
                    d.urgent ? "text-red-400" : "text-neutral-500",
                  )}
                >
                  {d.urgent ? "Due soon" : "Upcoming"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-neutral-600">
            Nothing on the horizon.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Calendar ----------

export default function Calendar() {
  const [monthIndex, setMonthIndex] = React.useState(1); // February, matching the reference
  const [year] = React.useState(() => new Date().getFullYear());

  const weeks = React.useMemo(
    () => getMonthGrid(year, monthIndex),
    [year, monthIndex],
  );

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === monthIndex;

  const goToPrevMonth = () => setMonthIndex((m) => (m + 11) % 12);
  const goToNextMonth = () => setMonthIndex((m) => (m + 1) % 12);

  return (
    <div className="flex w-full max-w-6xl gap-4">
      <MonthRail activeMonth={monthIndex} onSelect={setMonthIndex} />

      <div className="flex-1 rounded-3xl border border-white/5 bg-neutral-900 p-6 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {months[monthIndex]}{" "}
            <span className="text-neutral-500">{year}</span>
          </h1>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextMonth}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {weekdays.map((w) => (
            <span
              key={w}
              className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-600"
            >
              {w}
            </span>
          ))}

          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <DayCell
                key={`${wi}-${di}`}
                day={day}
                monthEvents={events}
                isToday={isCurrentMonth && day === today.getDate()}
              />
            )),
          )}
        </div>
      </div>

      <UpcomingPanel items={deadlines} monthLabel={months[monthIndex]} />
    </div>
  );
}
