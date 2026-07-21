import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      select: { categoryId: true, subserviceId: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Find matching checklist template for subservice or category
    const template = await db.checklistTemplate.findFirst({
      where: {
        OR: [
          { subserviceId: request.subserviceId ?? undefined },
          { categoryId: request.categoryId },
        ],
      },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    const responses = await db.requestChecklistResponse.findMany({
      where: { requestId: params.id },
    });

    return NextResponse.json({ template, responses });
  } catch (error) {
    console.error("[checklist-api] Error fetching checklist:", error);
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
    const { responses } = body as {
      responses: { itemId: string; boolValue?: boolean; textValue?: string; numberValue?: number; photoUrl?: string }[];
    };

    if (!Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid responses format" }, { status: 400 });
    }

    await db.$transaction(
      responses.map((r) =>
        db.requestChecklistResponse.upsert({
          where: { requestId_itemId: { requestId: params.id, itemId: r.itemId } },
          update: {
            boolValue: r.boolValue ?? null,
            textValue: r.textValue ?? null,
            numberValue: r.numberValue ?? null,
            photoUrl: r.photoUrl ?? null,
          },
          create: {
            requestId: params.id,
            itemId: r.itemId,
            boolValue: r.boolValue ?? null,
            textValue: r.textValue ?? null,
            numberValue: r.numberValue ?? null,
            photoUrl: r.photoUrl ?? null,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: responses.length });
  } catch (error) {
    console.error("[checklist-api] Error submitting checklist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
