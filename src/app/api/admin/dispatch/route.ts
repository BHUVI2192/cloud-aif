import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    const [activeRequests, providers, trackingSessions] = await Promise.all([
      db.serviceRequest.findMany({
        where: {
          status: { in: ["SUBMITTED", "MATCHING", "ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED_NEARBY", "ARRIVED", "IN_PROGRESS", "COMPLETION_REVIEW"] },
          deletedAt: null,
        },
        include: {
          category: { select: { name: true } },
          serviceArea: { select: { name: true } },
          otp: { select: { isVerified: true, attempts: true, expiresAt: true } },
          assignments: {
            where: { status: "ACCEPTED" },
            include: {
              provider: {
                select: {
                  id: true,
                  displayName: true,
                  availabilityMode: true,
                  liveLocation: true,
                  user: { select: { name: true, phone: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.providerProfile.findMany({
        where: { status: "APPROVED", isActive: true, deletedAt: null },
        select: {
          id: true,
          displayName: true,
          availabilityMode: true,
          ratingAverage: true,
          liveLocation: true,
          user: { select: { name: true, phone: true } },
        },
      }),
      db.requestTrackingSession.findMany({
        where: { isActive: true },
        select: { requestId: true, providerId: true, startedAt: true },
      }),
    ]);

    return NextResponse.json({
      activeRequests,
      providers,
      trackingSessions,
    });
  } catch (error) {
    console.error("[admin-dispatch-api] Error fetching dispatch data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, newProviderId, reason } = body;

    if (!requestId || !newProviderId) {
      return NextResponse.json({ error: "Missing requestId or newProviderId" }, { status: 400 });
    }

    const request = await db.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Withdraw current pending/accepted assignments
    await db.providerAssignment.updateMany({
      where: { requestId, status: { in: ["PENDING", "ACCEPTED"] } },
      data: { status: "WITHDRAWN", responseNote: "Reassigned by Admin" },
    });

    // Create new assignment for target provider
    const newAssignment = await db.providerAssignment.create({
      data: {
        requestId,
        providerId: newProviderId,
        status: "PENDING",
        source: "ADMIN",
        createdById: session.user.id,
      },
    });

    // Update request status to ASSIGNED & log dispatch audit event
    await Promise.all([
      db.serviceRequest.update({
        where: { id: requestId },
        data: { status: "ASSIGNED", needsAdminAttention: false },
      }),
      db.dispatchAuditEvent.create({
        data: {
          requestId,
          actorId: session.user.id,
          action: "REASSIGNED",
          details: `Reassigned request ${requestId} to provider ${newProviderId}. Reason: ${reason || "Admin Manual Dispatch"}`,
        },
      }),
      db.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: request.status,
          toStatus: "ASSIGNED",
          changedById: session.user.id,
          note: `Manually reassigned to provider by Admin. Reason: ${reason || "Admin Dispatch"}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (error) {
    console.error("[admin-dispatch-api] Error executing reassignment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
