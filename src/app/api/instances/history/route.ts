import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { daysAgoUTC, endOfTodayUTC } from "@/lib/date-utils";

// GET /api/instances/history?days=7
// Read-only: does NOT create instances, just reports what already
// happened. Used by weekly-activities.tsx's last-7-days dot view.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = Math.min(31, Math.max(1, Number(searchParams.get("days")) || 7));

  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id, archived: false },
  });
  const activityIds = activities.map((a) => a.id);

  const rangeStart = daysAgoUTC(days - 1);
  const rangeEnd = endOfTodayUTC();

  const instances = activityIds.length
    ? await prisma.activityInstance.findMany({
        where: { activityId: { in: activityIds }, date: { gte: rangeStart, lt: rangeEnd } },
      })
    : [];

  // Bucket by calendar day (UTC): { "2026-08-08": { completed: 2, total: 5 } }
  const byDay = new Map<string, { completed: number; total: number }>();
  for (let i = 0; i < days; i++) {
    const d = daysAgoUTC(days - 1 - i);
    byDay.set(d.toISOString().slice(0, 10), { completed: 0, total: 0 });
  }
  for (const instance of instances) {
    const key = instance.date.toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    if (instance.status === "COMPLETED") bucket.completed += 1;
  }

  const days_ = Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }));

  return NextResponse.json({ days: days_ });
}
