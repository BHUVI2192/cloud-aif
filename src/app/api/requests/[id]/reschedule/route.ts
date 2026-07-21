import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newDate, newTime, reason } = body;

    if (!newDate || !reason) {
      return NextResponse.json({ error: "Missing newDate or reason" }, { status: 400 });
    }

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const reschedule = await db.rescheduleEvent.create({
      data: {
        requestId: params.id,
        requestedById: session.user.id,
        oldDate: request.preferredDate,
        oldTime: request.preferredTime,
        newDate: new Date(newDate),
        newTime: newTime || null,
        reason,
        status: "APPROVED",
      },
    });

    await db.$transaction([
      db.serviceRequest.update({
        where: { id: params.id },
        data: {
          preferredDate: new Date(newDate),
          preferredTime: newTime || null,
        },
      }),
      db.requestStatusHistory.create({
        data: {
          requestId: params.id,
          fromStatus: request.status,
          toStatus: request.status,
          changedById: session.user.id,
          note: `Request rescheduled to ${newDate} ${newTime || ""}. Reason: ${reason}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, reschedule });
  } catch (error) {
    console.error("[reschedule-api] Error rescheduling request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
