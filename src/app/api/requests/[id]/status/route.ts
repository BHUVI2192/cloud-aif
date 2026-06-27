import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const request = await db.serviceRequest.findUnique({
    where: { id: params.id },
    include: { assignments: { where: { status: { in: ["ACCEPTED", "PENDING"] } }, include: { provider: true } } },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = session.user.role;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isOwner = request.customerId === session.user.id;
  const isAssignedProvider = request.assignments.some((a) => a.status === "ACCEPTED" && a.provider.userId === session.user.id);
  if (!isAdmin && !isOwner && !isAssignedProvider)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const next = parsed.data.status;
  await db.$transaction(async (tx) => {
    await tx.serviceRequest.update({
      where: { id: request.id },
      data: {
        status: next,
        completedAt: next === "COMPLETED" ? new Date() : request.completedAt,
        cancelledAt: next === "CANCELLED" ? new Date() : request.cancelledAt,
        cancellationReason: next === "CANCELLED" ? parsed.data.note : request.cancellationReason,
      },
    });
    await tx.requestStatusHistory.create({
      data: { requestId: request.id, fromStatus: request.status, toStatus: next, changedById: session.user.id, note: parsed.data.note },
    });
    
    if (next === "COMPLETED") {
      // Mark accepted assignments as COMPLETED and increment jobs count
      const acceptedAssignments = request.assignments.filter((a) => a.status === "ACCEPTED");
      for (const a of acceptedAssignments) {
        await tx.providerProfile.update({ where: { id: a.providerId }, data: { jobsCompleted: { increment: 1 } } });
        await tx.providerAssignment.update({ where: { id: a.id }, data: { status: "COMPLETED" } });
      }
    } else if (next === "CANCELLED") {
      // Mark any pending or accepted assignments as WITHDRAWN
      for (const a of request.assignments) {
        await tx.providerAssignment.update({ where: { id: a.id }, data: { status: "WITHDRAWN" } });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
