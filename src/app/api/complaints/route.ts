import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ComplaintType, ComplaintPriority } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, providerId, type, subject, description, priority } = body;

    if (!subject || !description) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
    }

    const complaint = await db.complaint.create({
      data: {
        requestId: requestId || null,
        providerId: providerId || null,
        complainantId: session.user.id,
        type: (type as ComplaintType) || "SERVICE_QUALITY",
        priority: (priority as ComplaintPriority) || "MEDIUM",
        subject,
        description,
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (err: any) {
    console.error("[Complaint Submission Error]:", err);
    return NextResponse.json({ error: err?.message || "Failed to submit issue report" }, { status: 500 });
  }
}
