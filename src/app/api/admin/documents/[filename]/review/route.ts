import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { filename: string } }) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, notes } = body; // action: "APPROVE" | "REJECT" | "RESUBMIT"

    if (!["APPROVE", "REJECT", "RESUBMIT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const docId = params.filename;

    const doc = await db.providerDocument.findUnique({
      where: { id: docId },
      include: { provider: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const newDocStatus = action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "RESUBMIT_REQUIRED";

    const updatedDoc = await db.providerDocument.update({
      where: { id: docId },
      data: {
        status: newDocStatus,
        notes: notes || null,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // Check overall provider verification state
    const allDocs = await db.providerDocument.findMany({
      where: { providerId: doc.providerId },
    });

    const hasApprovedId = allDocs.some((d) => d.type === "ID_PROOF" && d.status === "APPROVED");
    const hasApprovedAddress = allDocs.some((d) => d.type === "ADDRESS_PROOF" && d.status === "APPROVED");
    const isFullyApproved = hasApprovedId && hasApprovedAddress;

    await db.providerProfile.update({
      where: { id: doc.providerId },
      data: {
        verificationStatus: isFullyApproved ? "APPROVED" : "IN_REVIEW",
        verifiedBadge: isFullyApproved,
        status: isFullyApproved ? "APPROVED" : "UNDER_REVIEW",
        isActive: isFullyApproved,
      },
    });

    // Write full audit trail to AdminActionLog
    await db.adminActionLog.create({
      data: {
        actorId: session.user.id,
        action: action === "APPROVE" ? "DOCUMENT_APPROVED" : "DOCUMENT_REJECTED",
        targetEntityType: "ProviderDocument",
        targetEntityId: docId,
        summary: `Admin ${action}d ${doc.type} for provider ${doc.provider.displayName}. Notes: ${notes || "None"}`,
      },
    });

    return NextResponse.json({ success: true, document: updatedDoc });
  } catch (err: any) {
    console.error("[Document Review Error]:", err);
    return NextResponse.json({ error: err?.message || "Document review failed" }, { status: 500 });
  }
}
