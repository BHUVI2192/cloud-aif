import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ProviderAvailabilityMode } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized provider access" }, { status: 401 });
    }

    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { availabilityMode: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    return NextResponse.json({ availabilityMode: provider.availabilityMode });
  } catch (error) {
    console.error("[availability-mode-api] Error fetching mode:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized provider access" }, { status: 401 });
    }

    const body = await req.json();
    const { mode } = body;

    if (!["ONLINE", "OFFLINE", "ON_BREAK"].includes(mode)) {
      return NextResponse.json({ error: "Invalid availability mode" }, { status: 400 });
    }

    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, availabilityMode: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Prevent hard offline if provider has active in-progress or en-route job
    if (mode === "OFFLINE") {
      const activeJob = await db.providerAssignment.findFirst({
        where: {
          providerId: provider.id,
          status: "ACCEPTED",
          request: {
            status: { in: ["EN_ROUTE", "ARRIVED_NEARBY", "ARRIVED", "IN_PROGRESS"] },
            deletedAt: null,
          },
        },
      });

      if (activeJob) {
        return NextResponse.json(
          { error: "Cannot go offline while you have an active job in progress" },
          { status: 400 }
        );
      }
    }

    const updated = await db.providerProfile.update({
      where: { id: provider.id },
      data: { availabilityMode: mode as ProviderAvailabilityMode },
      select: { id: true, availabilityMode: true },
    });

    return NextResponse.json({ success: true, availabilityMode: updated.availabilityMode });
  } catch (error) {
    console.error("[availability-mode-api] Error updating mode:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
