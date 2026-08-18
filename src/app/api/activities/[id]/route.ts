import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType, Frequency, LifeArea } from "@/generated/prisma";

const ACTIVITY_TYPES = Object.values(ActivityType);
const FREQUENCIES = Object.values(Frequency);
const LIFE_AREAS = Object.values(LifeArea);

// PATCH /api/activities/:id — edit fields, archive/unarchive, or set/clear
// the "push to tomorrow" nudge via queuedFor (see plan workspace README §7).
// Scoped so a user can only touch their own activities.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.activity.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    // Same 404 whether it doesn't exist or belongs to someone else —
    // don't leak which one it is.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    archived,
    queuedFor,
  } = (body ?? {}) as Record<string, unknown>;

  if (type !== undefined && !ACTIVITY_TYPES.includes(type as ActivityType)) {
    return NextResponse.json(
      { error: `type must be one of ${ACTIVITY_TYPES.join(", ")}` },
      { status: 400 },
    );
  }
  if (lifeArea !== undefined && !LIFE_AREAS.includes(lifeArea as LifeArea)) {
    return NextResponse.json(
      { error: `lifeArea must be one of ${LIFE_AREAS.join(", ")}` },
      { status: 400 },
    );
  }
  if (frequency !== undefined && !FREQUENCIES.includes(frequency as Frequency)) {
    return NextResponse.json(
      { error: `frequency must be one of ${FREQUENCIES.join(", ")}` },
      { status: 400 },
    );
  }
  if (
    queuedFor !== undefined &&
    queuedFor !== null &&
    (typeof queuedFor !== "string" || Number.isNaN(Date.parse(queuedFor)))
  ) {
    return NextResponse.json(
      { error: "queuedFor must be an ISO date string or null" },
      { status: 400 },
    );
  }

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      ...(typeof title === "string" ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description as string | null } : {}),
      ...(type !== undefined ? { type: type as ActivityType } : {}),
      ...(config !== undefined ? { config: config as object } : {}),
      ...(tagIds !== undefined ? { tagIds: tagIds as string[] } : {}),
      ...(lifeArea !== undefined ? { lifeArea: lifeArea as LifeArea } : {}),
      ...(frequency !== undefined ? { frequency: frequency as Frequency } : {}),
      ...(typeof basePoints === "number" ? { basePoints } : {}),
      ...(typeof archived === "boolean" ? { archived } : {}),
      ...(queuedFor !== undefined
        ? { queuedFor: queuedFor === null ? null : new Date(queuedFor as string) }
        : {}),
    },
  });

  return NextResponse.json({ activity });
}