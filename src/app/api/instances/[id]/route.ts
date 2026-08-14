import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/instances/:id
//
// Body shape: { action: string, ...extra }
//
//   SIMPLE   { action: "complete" }
//
//   COUNTER  { action: "increment" }              — progress += 1
//            { action: "decrement" }              — progress -= 1
//            { action: "setProgress", progress }  — absolute value
//            Auto-completes and awards proportional points once
//            progress reaches the activity's config.target.
//
//   TOGGLE   { action: "start" }     — begin a session
//            { action: "stop" }      — end the current session, accumulate durationSec
//            { action: "complete" }  — explicit Done button; requires
//                                      durationSec > 0 (>=1 session logged)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const instance = await prisma.activityInstance.findUnique({
    where: { id },
    include: { activity: true },
  });

  if (!instance || instance.activity.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, progress } = (body ?? {}) as Record<string, unknown>;
  if (typeof action !== "string") {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  const activity = instance.activity;

  // ---------------------------------------------------------------- SIMPLE
  if (activity.type === "SIMPLE") {
    if (action !== "complete") {
      return NextResponse.json(
        { error: `Unsupported action "${action}" for SIMPLE activity` },
        { status: 400 },
      );
    }
    if (instance.status === "COMPLETED") {
      return NextResponse.json({ instance }); // idempotent
    }
    const updated = await prisma.activityInstance.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        pointsEarned: activity.basePoints,
      },
    });
    return NextResponse.json({ instance: updated });
  }

  // --------------------------------------------------------------- COUNTER
  if (activity.type === "COUNTER") {
    if (instance.status === "COMPLETED") {
      return NextResponse.json({ instance }); // idempotent — already done
    }

    const config = (activity.config ?? {}) as { target?: number };
    const target = typeof config.target === "number" && config.target > 0 ? config.target : 1;

    let nextProgress = instance.progress;
    if (action === "increment") {
      nextProgress = instance.progress + 1;
    } else if (action === "decrement") {
      nextProgress = instance.progress - 1;
    } else if (action === "setProgress") {
      if (typeof progress !== "number" || Number.isNaN(progress)) {
        return NextResponse.json(
          { error: "progress must be a number for setProgress" },
          { status: 400 },
        );
      }
      nextProgress = progress;
    } else {
      return NextResponse.json(
        { error: `Unsupported action "${action}" for COUNTER activity` },
        { status: 400 },
      );
    }

    nextProgress = Math.max(0, Math.min(nextProgress, target));
    const reachedTarget = nextProgress >= target;

    const updated = await prisma.activityInstance.update({
      where: { id },
      data: {
        progress: nextProgress,
        status: reachedTarget ? "COMPLETED" : nextProgress > 0 ? "IN_PROGRESS" : "PENDING",
        completedAt: reachedTarget ? new Date() : null,
        pointsEarned: reachedTarget
          ? Math.round(activity.basePoints * (nextProgress / target))
          : 0,
      },
    });
    return NextResponse.json({ instance: updated });
  }

  // ---------------------------------------------------------------- TOGGLE
  if (activity.type === "TOGGLE") {
    if (instance.status === "COMPLETED" && action !== "complete") {
      return NextResponse.json({ instance }); // idempotent once done
    }

    if (action === "start") {
      if (instance.sessionStart) {
        return NextResponse.json({ instance }); // already running, no-op
      }
      const updated = await prisma.activityInstance.update({
        where: { id },
        data: { sessionStart: new Date(), status: "IN_PROGRESS" },
      });
      return NextResponse.json({ instance: updated });
    }

    if (action === "stop") {
      if (!instance.sessionStart) {
        return NextResponse.json({ instance }); // nothing running, no-op
      }
      const elapsedSec = Math.max(
        0,
        Math.round((Date.now() - instance.sessionStart.getTime()) / 1000),
      );
      const updated = await prisma.activityInstance.update({
        where: { id },
        data: {
          sessionStart: null,
          durationSec: instance.durationSec + elapsedSec,
        },
      });
      return NextResponse.json({ instance: updated });
    }

    if (action === "complete") {
      // If a session is still running, fold it in before completing.
      let durationSec = instance.durationSec;
      if (instance.sessionStart) {
        durationSec += Math.max(
          0,
          Math.round((Date.now() - instance.sessionStart.getTime()) / 1000),
        );
      }
      if (durationSec <= 0) {
        return NextResponse.json(
          { error: "Log at least one session before marking this done" },
          { status: 400 },
        );
      }
      const updated = await prisma.activityInstance.update({
        where: { id },
        data: {
          sessionStart: null,
          durationSec,
          status: "COMPLETED",
          completedAt: new Date(),
          pointsEarned: activity.basePoints,
        },
      });
      return NextResponse.json({ instance: updated });
    }

    return NextResponse.json(
      { error: `Unsupported action "${action}" for TOGGLE activity` },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Unknown activity type" }, { status: 400 });
}
