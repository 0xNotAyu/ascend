import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tags — list the signed-in user's tags.
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ tags });
}

// POST /api/tags — create a tag (used by /plan's create-on-the-fly tag field).
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

  const { name, color, icon } = (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // Reuse an existing tag with the same name instead of creating a duplicate.
  const existing = await prisma.tag.findFirst({
    where: { userId: session.user.id, name: name.trim() },
  });
  if (existing) {
    return NextResponse.json({ tag: existing }, { status: 200 });
  }

  const tag = await prisma.tag.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      color: typeof color === "string" && color.trim().length > 0 ? color : "neutral-500",
      icon: typeof icon === "string" ? icon : undefined,
    },
  });

  return NextResponse.json({ tag }, { status: 201 });
}
