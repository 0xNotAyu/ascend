import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType, Frequency, LifeArea } from "@/generated/prisma";

const ACTIVITY_TYPES = Object.values(ActivityType);
const FREQUENCIES = Object.values(Frequency);
const LIFE_AREAS = Object.values(LifeArea);

// POST /api/activities — create an activity for the signed-in user.
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    title,
    description,
    type,
    config,
    tagIds,
    lifeArea,
    frequency,
    basePoints,
  } = (body ?? {}) as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (typeof type !== "string" || !ACTIVITY_TYPES.includes(type as ActivityType)) {
    return NextResponse.json(
      { error: `type must be one of ${ACTIVITY_TYPES.join(", ")}` },
      { status: 400 },
    );
  }
  if (typeof lifeArea !== "string" || !LIFE_AREAS.includes(lifeArea as LifeArea)) {
    return NextResponse.json(
      { error: `lifeArea must be one of ${LIFE_AREAS.join(", ")}` },
      { status: 400 },
    );
  }
  if (typeof frequency !== "string" || !FREQUENCIES.includes(frequency as Frequency)) {
    return NextResponse.json(
      { error: `frequency must be one of ${FREQUENCIES.join(", ")}` },
      { status: 400 },
    );
  }
  if (
    tagIds !== undefined &&
    (!Array.isArray(tagIds) || !tagIds.every((t) => typeof t === "string"))
  ) {
    return NextResponse.json({ error: "tagIds must be an array of strings" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      description: typeof description === "string" ? description : undefined,
      type: type as ActivityType,
      config: (config ?? {}) as object,
      tagIds: (tagIds as string[] | undefined) ?? [],
      lifeArea: lifeArea as LifeArea,
      frequency: frequency as Frequency,
      basePoints: typeof basePoints === "number" ? basePoints : 10,
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}

// GET /api/activities — list the signed-in user's activities.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeArchived = searchParams.get("includeArchived") === "true";

  const activities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      ...(includeArchived ? {} : { archived: false }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ activities });
}
