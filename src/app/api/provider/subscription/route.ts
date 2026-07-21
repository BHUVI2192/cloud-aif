import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getSubscriptionMetrics } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const metrics = await getSubscriptionMetrics(provider.id);

    return NextResponse.json({ success: true, metrics });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body; // "STARTER" | "PRO" | "UNLIMITED"

    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updatedSub = await db.providerSubscription.update({
      where: { providerId: provider.id },
      data: {
        status: "ACTIVE",
        plan: plan || "PRO",
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        monthlyLeadLimit: plan === "UNLIMITED" ? null : plan === "STARTER" ? 50 : 100,
      },
    });

    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update subscription" }, { status: 500 });
  }
}
