import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { recordPlatformEvent } from "@/lib/attribution";
import { PlatformEventType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { eventType, providerId, requestId, channel, source } = body;

    if (!eventType || !Object.values(PlatformEventType).includes(eventType)) {
      return NextResponse.json({ error: "Invalid or missing eventType" }, { status: 400 });
    }

    await recordPlatformEvent(eventType as PlatformEventType, {
      actorId: session?.user?.id,
      actorRole: session?.user?.role as any,
      providerId,
      requestId,
      metadata: { channel, source, userAgent: req.headers.get("user-agent") },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Attribution error" }, { status: 500 });
  }
}
