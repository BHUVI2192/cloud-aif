import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { AssignmentStatus, RequestStatus, AssignmentSource, NotificationType } from "@prisma/client";

const schema = z.object({
  providerId: z.string().min(1),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { providerId } = parsed.data;

  // 1. Fetch Request
  const request = await db.serviceRequest.findUnique({
    where: { id: params.id },
  });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // 2. Fetch Provider
  const provider = await db.providerProfile.findUnique({
    where: { id: providerId },
    include: { user: true },
  });
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  // 3. Check if already assigned
  const existing = await db.providerAssignment.findUnique({
    where: {
      requestId_providerId: {
        requestId: request.id,
        providerId: provider.id,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Provider is already assigned to this request" }, { status: 400 });
  }

  // 4. Update in a transaction
  await db.$transaction(async (tx) => {
    // Create assignment
    await tx.providerAssignment.create({
      data: {
        requestId: request.id,
        providerId: provider.id,
        status: "PENDING" as AssignmentStatus,
        source: "ADMIN" as AssignmentSource,
        createdById: session.user.id,
      },
    });

    // Update request status if it was SUBMITTED or MATCHING
    if (request.status === "SUBMITTED" || request.status === "MATCHING") {
      await tx.serviceRequest.update({
        where: { id: request.id },
        data: { status: "ASSIGNED" as RequestStatus },
      });

      await tx.requestStatusHistory.create({
        data: {
          requestId: request.id,
          fromStatus: request.status,
          toStatus: "ASSIGNED" as RequestStatus,
          changedById: session.user.id,
          note: `Assigned to provider: ${provider.displayName}`,
        },
      });
    }

    // Create notification for the provider
    await tx.notification.create({
      data: {
        userId: provider.userId,
        type: "REQUEST_ASSIGNED" as NotificationType,
        title: "New Job Lead Available",
        body: `You have been assigned a new lead: "${request.title}". Please accept or decline it in your dashboard.`,
      },
    });

    // Log admin action
    await tx.adminActionLog.create({
      data: {
        actorId: session.user.id,
        action: "REQUEST_ASSIGNED",
        targetEntityType: "ServiceRequest",
        targetEntityId: request.id,
        summary: `Assigned provider ${provider.displayName} (${provider.id}) to request ${request.title}`,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
