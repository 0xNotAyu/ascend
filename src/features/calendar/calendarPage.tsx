"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";

type Goal = {
  title: string;
  current: number;
  target: number;
  unit: string;
};

type Deadline = {
  title: string;
  date: string;
  time?: string;
  type: string;
};

const goals: Goal[] = [
  {
    title: "Write blogs",
    current: 5,
    target: 8,
    unit: "blogs",
  },
  {
    title: "Post videos",
    current: 3,
    target: 5,
    unit: "videos",
  },
  {
    title: "Complete workouts",
    current: 4,
    target: 6,
    unit: "workouts",
  },
];

const deadlines: Deadline[] = [
  {
    title: "AyuDark Chrome submission",
    date: "Aug 21",
    time: "11:59 PM",
    type: "PROJECT",
  },
  {
    title: "GenAI cohort assignment",
    date: "Aug 23",
    time: "10:00 PM",
    type: "ASSIGNMENT",
  },
  {
    title: "Client video delivery",
    date: "Aug 25",
    time: "6:00 PM",
    type: "CLIENT",
  },
  {
    title: "Portfolio update",
    date: "Aug 28",
    type: "PERSONAL",
  },
];

const MONTHS = [
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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 19));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);

    // Convert Sunday = 0 into Monday = 0
    const startDay = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const previousMonthDays = new Date(year, month, 0).getDate();

    const result: {
      date: number;
      currentMonth: boolean;
    }[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
      result.push({
        date: previousMonthDays - i,
        currentMonth: false,
      });
    }

    for (let date = 1; date <= daysInMonth; date++) {
      result.push({
        date,
        currentMonth: true,
      });
    }

    let nextDate = 1;

    while (result.length < 42) {
      result.push({
        date: nextDate++,
        currentMonth: false,
      });
    }

    return result;
  }, [year, month]);

  const goPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: number) => {
    const today = new Date();

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === date
    );
  };

  const getEvents = (date: number) => {
    if (month !== 7 || year !== 2026) return [];

    if (date === 21) {
      return ["AyuDark submission"];
    }

    if (date === 23) {
      return ["GenAI assignment"];
    }

    if (date === 25) {
      return ["Client delivery"];
    }

    if (date === 28) {
      return ["Portfolio update"];
    }

    if (date === 19) {
      return ["Morning run"];
    }

    if (date === 20) {
      return ["Write blog"];
    }

    return [];
  };

  return (
    // Replace your current SECTION 1 + SECTION 2 layout with this structure:

<main className="h-screen overflow-hidden bg-neutral-800 p-6 pl-24">
  <div className="mx-auto flex h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-neutral-900">

    {/* =========================================================
        LEFT — GOALS + DEADLINES
        1/3 WIDTH
       ========================================================= */}

    <section className="flex w-1/3 shrink-0 flex-col border-r border-white/[0.06]">

      {/* Goals — TOP HALF */}
      <div className="flex h-1/2 flex-col border-b border-white/[0.06] p-6">
        <div className="mb-5 flex items-center gap-2">
          <Target className="size-4 text-neutral-500" />

          <div>
            <h2 className="text-sm font-semibold text-white">
              Goals
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              This week
            </p>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto">
          {goals.map((goal) => {
            const percentage = Math.min(
              (goal.current / goal.target) * 100,
              100,
            );

            return (
              <div key={goal.title}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-neutral-300">
                    {goal.title}
                  </p>

                  <p className="text-xs text-neutral-500">
                    <span className="font-medium text-neutral-200">
                      {goal.current}
                    </span>{" "}
                    / {goal.target} {goal.unit}
                  </p>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-neutral-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Deadlines — BOTTOM HALF */}
      <div className="flex h-1/2 min-h-0 flex-col p-6">
        <div className="mb-5 flex items-center gap-2">
          <Clock3 className="size-4 text-neutral-500" />

          <div>
            <h2 className="text-sm font-semibold text-white">
              Upcoming deadlines
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Coming up
            </p>
          </div>
        </div>

        <div className="space-y-1 overflow-y-auto">
          {deadlines.map((deadline) => (
            <div
              key={deadline.title}
              className="
                group flex items-center gap-3
                rounded-xl px-3 py-2.5
                transition-colors
                hover:bg-white/[0.03]
              "
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xs font-semibold text-neutral-300">
                {deadline.date.split(" ")[1]}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-200">
                  {deadline.title}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-600">
                    {deadline.type}
                  </span>

                  {deadline.time && (
                    <>
                      <span className="text-neutral-700">·</span>
                      <span className="text-xs text-neutral-500">
                        {deadline.time}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>


    {/* =========================================================
        RIGHT — MONTHLY CALENDAR
        2/3 WIDTH
       ========================================================= */}

    <section className="flex min-w-0 flex-1 flex-col">

      {/* Calendar header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-4 text-neutral-500" />

          <h2 className="text-base font-semibold text-white">
            {MONTHS[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToday}
            className="
              mr-2 rounded-lg px-3 py-1.5
              text-xs font-medium text-neutral-400
              transition-colors
              hover:bg-white/[0.05]
              hover:text-white
            "
          >
            Today
          </button>

          <button
            type="button"
            onClick={goPreviousMonth}
            className="
              flex size-8 items-center justify-center rounded-lg
              text-neutral-500 transition-colors
              hover:bg-white/[0.05] hover:text-white
            "
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={goNextMonth}
            className="
              flex size-8 items-center justify-center rounded-lg
              text-neutral-500 transition-colors
              hover:bg-white/[0.05] hover:text-white
            "
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid shrink-0 grid-cols-7 border-b border-white/[0.06]">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="
              border-r border-white/[0.04]
              px-4 py-2.5
              text-[10px] font-medium uppercase
              tracking-wider text-neutral-600
            "
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {days.map((day, index) => {
          const events = day.currentMonth
            ? getEvents(day.date)
            : [];

          return (
            <div
              key={`${day.date}-${index}`}
              className="
                min-h-0 overflow-hidden
                border-b border-r border-white/[0.05]
                p-3
              "
            >
              <div className="flex items-center justify-between">
                <span
                  className={`
                    flex size-7 items-center justify-center
                    rounded-full text-xs font-medium
                    ${
                      !day.currentMonth
                        ? "text-neutral-700"
                        : isToday(day.date)
                          ? "bg-white text-neutral-900"
                          : "text-neutral-400"
                    }
                  `}
                >
                  {day.date}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event}
                    className="
                      flex items-center gap-1.5
                      truncate rounded-md
                      bg-neutral-800 px-2 py-1
                      text-[10px] text-neutral-400
                    "
                  >
                    <Circle className="size-1.5 fill-current" />
                    <span className="truncate">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  </div>
</main>
  );
}