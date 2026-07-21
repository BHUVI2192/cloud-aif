import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { canTransition } from "@/lib/status-machine";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized provider access" }, { status: 401 });
    }

    const provider = await db.providerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { actions } = body as { actions: { id: string; type: string; requestId?: string; payload: any }[] };

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({ success: true, processedCount: 0 });
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const act of actions) {
      try {
        if (act.type === "STATUS_UPDATE" && act.requestId && act.payload?.status) {
          const reqItem = await db.serviceRequest.findUnique({ where: { id: act.requestId } });
          if (reqItem && canTransition(reqItem.status, act.payload.status)) {
            await db.$transaction([
              db.serviceRequest.update({
                where: { id: act.requestId },
                data: { status: act.payload.status },
              }),
              db.requestStatusHistory.create({
                data: {
                  requestId: act.requestId,
                  fromStatus: reqItem.status,
                  toStatus: act.payload.status,
                  changedById: session.user.id,
                  note: "Status updated via provider offline sync replay",
                },
              }),
            ]);
            processedCount++;
          }
        } else if (act.type === "PROOF_UPLOAD" && act.requestId && act.payload?.photoUrl) {
          await db.requestProofPhoto.create({
            data: {
              requestId: act.requestId,
              uploaderId: session.user.id,
              type: act.payload.type || "BEFORE",
              photoUrl: act.payload.photoUrl,
              caption: act.payload.caption || null,
            },
          });
          processedCount++;
        } else if (act.type === "LOCATION_PING" && act.payload?.latitude && act.payload?.longitude) {
          const staleAt = new Date(Date.now() + 5 * 60 * 1000);
          await db.providerLiveLocation.upsert({
            where: { providerId: provider.id },
            update: {
              latitude: act.payload.latitude,
              longitude: act.payload.longitude,
              heading: act.payload.heading || null,
              speed: act.payload.speed || null,
              staleAt,
            },
            create: {
              providerId: provider.id,
              latitude: act.payload.latitude,
              longitude: act.payload.longitude,
              heading: act.payload.heading || null,
              speed: act.payload.speed || null,
              staleAt,
            },
          });
          processedCount++;
        }
      } catch (err) {
        errors.push(`Action ${act.id} failed: ${String(err)}`);
      }
    }

    return NextResponse.json({ success: true, processedCount, errors });
  } catch (error) {
    console.error("[offline-sync-api] Error processing sync:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
