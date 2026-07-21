import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { canTransition } from "@/lib/status-machine";

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
    const { reason, category } = body;

    if (!reason) {
      return NextResponse.json({ error: "Reason is required for cancellation" }, { status: 400 });
    }

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          where: { status: "ACCEPTED" },
          include: { provider: { select: { userId: true } } },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (!canTransition(request.status, "CANCELLED")) {
      return NextResponse.json({ error: `Cannot cancel a request with status ${request.status}` }, { status: 400 });
    }

    const isCustomer = request.customerId === session.user.id;
    const isProvider = request.assignments.some((a) => a.provider.userId === session.user.id);
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isCustomer && !isProvider && !isAdmin) {
      return NextResponse.json({ error: "Forbidden access to cancel request" }, { status: 403 });
    }

    let cancelCategory = category || "CUSTOMER_CANCELLED";
    if (isProvider) cancelCategory = "PROVIDER_CANCELLED";
    if (isAdmin) cancelCategory = "ADMIN_CANCELLED";

    const cancellation = await db.cancellationEvent.create({
      data: {
        requestId: params.id,
        cancelledById: session.user.id,
        reason,
        category: cancelCategory,
      },
    });

    await db.$transaction([
      db.serviceRequest.update({
        where: { id: params.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      }),
      db.requestStatusHistory.create({
        data: {
          requestId: params.id,
          fromStatus: request.status,
          toStatus: "CANCELLED",
          changedById: session.user.id,
          note: `Request cancelled (${cancelCategory}). Reason: ${reason}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, cancellation });
  } catch (error) {
    console.error("[cancel-api] Error cancelling request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
