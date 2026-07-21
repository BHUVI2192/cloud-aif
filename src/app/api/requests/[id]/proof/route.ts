import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ProofType } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const proofs = await db.requestProofPhoto.findMany({
      where: { requestId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        uploader: { select: { name: true, image: true, role: true } },
      },
    });

    return NextResponse.json({ proofs });
  } catch (error) {
    console.error("[proof-api] Error fetching proofs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { type, photoUrl, caption, latitude, longitude } = body;

    if (!["BEFORE", "AFTER"].includes(type) || !photoUrl) {
      return NextResponse.json({ error: "Invalid type or missing photoUrl" }, { status: 400 });
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
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    const isProvider = request.assignments.some((a) => a.provider.userId === session.user.id);
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (!isProvider && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. Only assigned provider can upload proof" }, { status: 403 });
    }

    const proof = await db.requestProofPhoto.create({
      data: {
        requestId: params.id,
        uploaderId: session.user.id,
        type: type as ProofType,
        photoUrl,
        caption: caption || null,
        latitude: latitude || null,
        longitude: longitude || null,
      },
    });

    return NextResponse.json({ success: true, proof });
  } catch (error) {
    console.error("[proof-api] Error uploading proof:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
