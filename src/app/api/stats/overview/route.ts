import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { daysAgoUTC, startOfWeekUTC, endOfTodayUTC } from "@/lib/date-utils";

// GET /api/stats/overview
// Returns: total points (all-time + this week), 7-day completion %,
// points-by-tag as a simple sorted list (no chart lib — see PRD §5.3).
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const activities = await prisma.activity.findMany({ where: { userId } });
  const activityIds = activities.map((a) => a.id);
  const activityById = new Map(activities.map((a) => [a.id, a]));

  if (activityIds.length === 0) {
    return NextResponse.json({
      totalPointsAllTime: 0,
      totalPointsThisWeek: 0,
      completionRate7d: 0,
      pointsByTag: [],
    });
  }

  const allInstances = await prisma.activityInstance.findMany({
    where: { activityId: { in: activityIds } },
  });

  const totalPointsAllTime = allInstances.reduce((sum, i) => sum + i.pointsEarned, 0);

  const weekStart = startOfWeekUTC();
  const totalPointsThisWeek = allInstances
    .filter((i) => i.date >= weekStart)
    .reduce((sum, i) => sum + i.pointsEarned, 0);

  // 7-day completion rate: completed instances / total instances due
  // in the last 7 days (today inclusive).
  const sevenDaysAgo = daysAgoUTC(6); // today + 6 previous days = 7 days
  const rangeEnd = endOfTodayUTC();
  const last7 = allInstances.filter((i) => i.date >= sevenDaysAgo && i.date < rangeEnd);
  const completionRate7d =
    last7.length === 0
      ? 0
      : Math.round((last7.filter((i) => i.status === "COMPLETED").length / last7.length) * 100);

  // Points by tag — an activity can have multiple tags; a completed
  // instance's points are counted once per tag it belongs to.
  const tags = await prisma.tag.findMany({ where: { userId } });
  const tagById = new Map(tags.map((t) => [t.id, t]));
  const pointsByTagId = new Map<string, number>();
  let untagged = 0;

  for (const instance of allInstances) {
    if (instance.pointsEarned <= 0) continue;
    const activity = activityById.get(instance.activityId);
    if (!activity || activity.tagIds.length === 0) {
      untagged += instance.pointsEarned;
      continue;
    }
    for (const tagId of activity.tagIds) {
      pointsByTagId.set(tagId, (pointsByTagId.get(tagId) ?? 0) + instance.pointsEarned);
    }
  }

  const pointsByTag = Array.from(pointsByTagId.entries())
    .map(([tagId, points]) => ({
      tagId,
      name: tagById.get(tagId)?.name ?? "Unknown tag",
      color: tagById.get(tagId)?.color ?? "neutral-500",
      points,
    }))
    .sort((a, b) => b.points - a.points);

  if (untagged > 0) {
    pointsByTag.push({ tagId: "untagged", name: "Untagged", color: "neutral-600", points: untagged });
  }

  return NextResponse.json({
    totalPointsAllTime,
    totalPointsThisWeek,
    completionRate7d,
    pointsByTag,
  });
}
