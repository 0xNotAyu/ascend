import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfTodayUTC, endOfTodayUTC, startOfWeekUTC } from "@/lib/date-utils";

// GET /api/instances/today
//
// For every active (non-archived) activity belonging to the signed-in
// user, figure out whether it's "due" and lazily create today's
// ActivityInstance if one doesn't exist yet. Calling this twice in the
// same day must NOT create duplicates.
//
// Due rules (v1, no cron — see PRD §7):
//   DAILY     — due every day. One instance per calendar day.
//   WEEKLY    — due once per week. If an instance already exists anywhere
//               in the current week, reuse it instead of making a new one.
//   ONE_TIME  — due once, ever. If any instance already exists for this
//               activity, reuse it; otherwise create today's.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = startOfTodayUTC();
  const todayEnd = endOfTodayUTC();
  const weekStart = startOfWeekUTC();

  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id, archived: false },
  });

  const instances = await Promise.all(
    activities.map(async (activity) => {
      if (activity.frequency === "DAILY") {
        const existing = await prisma.activityInstance.findFirst({
          where: { activityId: activity.id, date: { gte: todayStart, lt: todayEnd } },
        });
        if (existing) return existing;
        return prisma.activityInstance.create({
          data: { activityId: activity.id, date: todayStart },
        });
      }

      if (activity.frequency === "WEEKLY") {
        const existing = await prisma.activityInstance.findFirst({
          where: { activityId: activity.id, date: { gte: weekStart } },
          orderBy: { date: "desc" },
        });
        if (existing) return existing;
        return prisma.activityInstance.create({
          data: { activityId: activity.id, date: todayStart },
        });
      }

      // ONE_TIME
      const existing = await prisma.activityInstance.findFirst({
        where: { activityId: activity.id },
        orderBy: { date: "desc" },
      });
      if (existing) return existing;
      return prisma.activityInstance.create({
        data: { activityId: activity.id, date: todayStart },
      });
    }),
  );

  // Attach the parent activity so the UI has type/title/points without a
  // second round trip.
  const activityById = new Map(activities.map((a) => [a.id, a]));
  const enriched = instances.map((instance) => ({
    ...instance,
    activity: activityById.get(instance.activityId),
  }));

  return NextResponse.json({ instances: enriched });
}
