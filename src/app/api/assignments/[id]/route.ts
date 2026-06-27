import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

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

  // Fetch request and customer details to email them afterwards
  const serviceReq = await db.serviceRequest.findUnique({
    where: { id: assignment.requestId },
    include: {
      customer: { select: { email: true, name: true } },
    },
  });

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
        data: {
          requestId: assignment.requestId,
          fromStatus: "ASSIGNED",
          toStatus: "ACCEPTED",
          changedById: session.user.id,
          note: "Provider accepted",
        },
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

  // Send email to customer asynchronously if the provider accepted
  if (accept && serviceReq?.customer?.email) {
    sendEmail({
      to: serviceReq.customer.email,
      subject: `Cloud AIF: Provider Confirmed for "${serviceReq.title}"`,
      text: `Hello ${serviceReq.customer.name || "Customer"},\n\n`
        + `Good news! A verified provider (${provider.displayName}) has accepted your service request:\n\n`
        + `Request: "${serviceReq.title}"\n`
        + `Status: Provider Confirmed\n\n`
        + `You can view provider details, ratings, and phone number in your dashboard to coordinate:\n`
        + `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/request/${serviceReq.id}\n\n`
        + `Best regards,\nCloud AIF Team`,
    }).catch((err) => {
      console.error("[assignments] Error sending customer notification email", err);
    });
  }

  return NextResponse.json({ ok: true });
}
