import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({ action: z.enum(["ACCEPT", "DECLINE"]), note: z.string().optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PROVIDER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const provider = await db.providerProfile.findUnique({ where: { userId: session.user.id } });
  if (!provider) return NextResponse.json({ error: "No provider profile" }, { status: 404 });

  const assignment = await db.providerAssignment.findUnique({ where: { id: params.id } });
  if (!assignment || assignment.providerId !== provider.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const accept = parsed.data.action === "ACCEPT";
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.providerAssignment.update({
      where: { id: assignment.id },
      data: {
        status: accept ? "ACCEPTED" : "DECLINED",
        responseNote: parsed.data.note,
        respondedAt: now,
        acceptedAt: accept ? now : null,
        declinedAt: accept ? null : now,
      },
    });
    if (accept) {
      await tx.serviceRequest.update({ where: { id: assignment.requestId }, data: { status: "ACCEPTED" } });
      await tx.requestStatusHistory.create({
        data: { requestId: assignment.requestId, fromStatus: "ASSIGNED", toStatus: "ACCEPTED", changedById: session.user.id, note: "Provider accepted" },
      });
    } else {
      // Provider declined — put request back to MATCHING so admin can reassign
      const req = await tx.serviceRequest.findUnique({ where: { id: assignment.requestId }, select: { status: true } });
      if (req && req.status === "ASSIGNED") {
        await tx.serviceRequest.update({ where: { id: assignment.requestId }, data: { status: "MATCHING" } });
        await tx.requestStatusHistory.create({
          data: {
            requestId: assignment.requestId,
            fromStatus: "ASSIGNED",
            toStatus: "MATCHING",
            changedById: session.user.id,
            note: `Provider declined${parsed.data.note ? `: ${parsed.data.note}` : ""}. Looking for another provider.`,
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
