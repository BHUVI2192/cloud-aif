import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  action: z.enum(["APPROVE", "REJECT", "REQUEST_INFO", "SUSPEND", "REINSTATE"]),
  notes: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const provider = await db.providerProfile.findUnique({ where: { id: params.id } });
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const map = {
    APPROVE: { status: "APPROVED", verificationStatus: "APPROVED", verifiedBadge: true, isActive: true, action: "PROVIDER_APPROVED" },
    REJECT: { status: "REJECTED", verificationStatus: "REJECTED", verifiedBadge: false, isActive: false, action: "PROVIDER_REJECTED" },
    REQUEST_INFO: { status: "NEEDS_MORE_INFO", verificationStatus: "CHANGES_REQUESTED", verifiedBadge: false, isActive: false, action: "PROVIDER_INFO_REQUESTED" },
    SUSPEND: { status: "SUSPENDED", verificationStatus: provider.verificationStatus, verifiedBadge: provider.verifiedBadge, isActive: false, action: "PROVIDER_SUSPENDED" },
    REINSTATE: { status: "APPROVED", verificationStatus: "APPROVED", verifiedBadge: true, isActive: true, action: "PROVIDER_REINSTATED" },
  } as const;
  const m = map[parsed.data.action];

  await db.$transaction(async (tx) => {
    await tx.providerProfile.update({
      where: { id: provider.id },
      data: {
        status: m.status as any,
        verificationStatus: m.verificationStatus as any,
        verifiedBadge: m.verifiedBadge,
        isActive: m.isActive,
        suspendedReason: parsed.data.action === "SUSPEND" ? parsed.data.notes : provider.suspendedReason,
        suspendedAt: parsed.data.action === "SUSPEND" ? new Date() : provider.suspendedAt,
      },
    });
    
    let docStatus: any = null;
    if (parsed.data.action === "APPROVE" || parsed.data.action === "REINSTATE") {
      docStatus = "APPROVED";
    } else if (parsed.data.action === "REJECT") {
      docStatus = "REJECTED";
    } else if (parsed.data.action === "REQUEST_INFO") {
      docStatus = "RESUBMIT_REQUIRED";
    }

    if (docStatus) {
      await tx.providerDocument.updateMany({
        where: { providerId: provider.id },
        data: {
          status: docStatus,
          reviewedById: session.user.id,
          reviewedAt: new Date(),
          notes: parsed.data.notes || `Updated via provider profile action: ${parsed.data.action}`
        }
      });
    }

    await tx.providerVerificationReview.create({
      data: { providerId: provider.id, reviewerId: session.user.id, decision: m.verificationStatus as any, notes: parsed.data.notes },
    });
    await tx.adminActionLog.create({
      data: { actorId: session.user.id, action: m.action as any, targetEntityType: "ProviderProfile", targetEntityId: provider.id, summary: parsed.data.notes },
    });
  });

  return NextResponse.json({ ok: true });
}
