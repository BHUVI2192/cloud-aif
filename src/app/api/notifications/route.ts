import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/notifications — fetch all notifications for the current user
export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark all as read (or specific IDs)
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids: string[] = body.ids ?? [];

  if (ids.length > 0) {
    await db.notification.updateMany({
      where: { id: { in: ids }, userId: session.user.id },
      data: { readAt: new Date() },
    });
  } else {
    // Mark all as read
    await db.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
