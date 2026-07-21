import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { recordPlatformEvent } from "@/lib/attribution";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { wasCompleted, selfReportedValue, customerFeedback } = body;

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          where: { status: "ACCEPTED" },
          include: { provider: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const assignedProvider = request.assignments[0]?.provider;
    if (!assignedProvider) {
      return NextResponse.json({ error: "No assigned provider found" }, { status: 400 });
    }

    const isAssignedProvider = assignedProvider.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isAssignedProvider && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. Only assigned provider or admin can record outcome" }, { status: 403 });
    }

    const numericValue = parseFloat(String(selfReportedValue)) || 0;

    // Save or update outcome
    const outcome = await db.jobOutcome.upsert({
      where: { requestId: params.id },
      create: {
        requestId: params.id,
        providerId: assignedProvider.id,
        wasCompleted: Boolean(wasCompleted),
        selfReportedValue: numericValue,
        customerFeedback,
      },
      update: {
        wasCompleted: Boolean(wasCompleted),
        selfReportedValue: numericValue,
        customerFeedback,
      },
    });

    // Update request status to COMPLETED if not already
    if (request.status !== "COMPLETED" && wasCompleted) {
      await db.serviceRequest.update({
        where: { id: params.id },
        data: { status: "COMPLETED" },
      });

      await db.providerProfile.update({
        where: { id: assignedProvider.id },
        data: { jobsCompleted: { increment: 1 } },
      });
    }

    // Log platform event for ROI tracking
    await recordPlatformEvent("JOB_COMPLETED", {
      actorId: session.user.id,
      actorRole: session.user.role as any,
      requestId: params.id,
      providerId: assignedProvider.id,
      customerId: request.customerId,
      subserviceId: request.subserviceId || undefined,
      metadata: { selfReportedValue: numericValue, wasCompleted },
    });

    return NextResponse.json({ success: true, outcome });
  } catch (err: any) {
    console.error("[Job Outcome Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to record job outcome" }, { status: 500 });
  }
}
