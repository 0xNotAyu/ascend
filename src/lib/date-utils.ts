// Day/week boundaries are computed in UTC so instance generation is
// deterministic regardless of server timezone. "Today" and "this week"
// are therefore UTC calendar days/weeks for v1 — acceptable for MVP,
// revisit if per-user timezones matter later.

export function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function endOfTodayUTC(): Date {
  const start = startOfTodayUTC();
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

// Monday-start week boundary.
export function startOfWeekUTC(): Date {
  const start = startOfTodayUTC();
  const day = start.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? 6 : day - 1;
  return new Date(start.getTime() - diffToMonday * 24 * 60 * 60 * 1000);
}

export function daysAgoUTC(n: number): Date {
  const start = startOfTodayUTC();
  return new Date(start.getTime() - n * 24 * 60 * 60 * 1000);
}
