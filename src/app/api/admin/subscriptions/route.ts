import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { providerId, action, status, plan, extendDays } = body;

    const sub = await db.providerSubscription.findUnique({
      where: { providerId },
    });

    if (!sub) {
      return NextResponse.json({ error: "Provider subscription not found" }, { status: 404 });
    }

    let updatedSub;

    if (action === "EXTEND_GRACE") {
      const days = Number(extendDays) || 7;
      const currentEndDate = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : new Date();
      const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);

      updatedSub = await db.providerSubscription.update({
        where: { providerId },
        data: {
          status: SubscriptionStatus.GRACE_PERIOD,
          currentPeriodEnd: newEndDate,
          gracePeriodEndsAt: new Date(newEndDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      updatedSub = await db.providerSubscription.update({
        where: { providerId },
        data: {
          status: status ? (status as SubscriptionStatus) : sub.status,
          plan: plan ? (plan as SubscriptionPlan) : sub.plan,
        },
      });
    }

    // Write audit trail
    await db.adminActionLog.create({
      data: {
        actorId: session.user.id,
        action: "SETTING_UPDATED",
        targetEntityType: "ProviderSubscription",
        targetEntityId: sub.id,
        summary: `Admin updated subscription for provider ${providerId}: Action=${action}, Status=${status || sub.status}, Plan=${plan || sub.plan}`,
      },
    });

    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (err: any) {
    console.error("[Admin Subscription Override Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to update subscription" }, { status: 500 });
  }
}
