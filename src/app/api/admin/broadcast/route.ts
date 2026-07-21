import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { NotificationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetSegment, title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    let targetUserIds: string[] = [];

    if (targetSegment === "ALL_PROVIDERS") {
      const providers = await db.providerProfile.findMany({ select: { userId: true } });
      targetUserIds = providers.map((p) => p.userId);
    } else if (targetSegment === "EXPIRING_TRIALS") {
      const subs = await db.providerSubscription.findMany({
        where: { status: "FREE_TRIAL" },
        select: { provider: { select: { userId: true } } },
      });
      targetUserIds = subs.map((s) => s.provider.userId);
    } else if (targetSegment === "ALL_CUSTOMERS") {
      const customers = await db.user.findMany({
        where: { role: "CUSTOMER" },
        select: { id: true },
      });
      targetUserIds = customers.map((c) => c.id);
    } else {
      const allUsers = await db.user.findMany({ select: { id: true } });
      targetUserIds = allUsers.map((u) => u.id);
    }

    // Batch create notifications
    await db.notification.createMany({
      data: targetUserIds.map((userId) => ({
        userId,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title,
        body: message,
      })),
    });

    // Write audit trail
    await db.adminActionLog.create({
      data: {
        actorId: session.user.id,
        action: "CONTENT_UPDATED",
        targetEntityType: "Notification",
        summary: `Admin broadcast sent to ${targetSegment} (${targetUserIds.length} users): ${title}`,
      },
    });

    return NextResponse.json({ success: true, recipientCount: targetUserIds.length });
  } catch (err: any) {
    console.error("[Broadcast Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to send broadcast" }, { status: 500 });
  }
}
