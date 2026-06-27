import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { canReviewRequest } from "@/lib/permissions";

const schema = z.object({
  requestId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { requestId, rating, comment } = parsed.data;

  if (!(await canReviewRequest(session.user.id, requestId)))
    return NextResponse.json({ error: "You can only review a completed request once." }, { status: 403 });

  const accepted = await db.providerAssignment.findFirst({
    where: { requestId, status: "ACCEPTED" },
  });
  if (!accepted) return NextResponse.json({ error: "No provider to review" }, { status: 400 });

  await db.$transaction(async (tx) => {
    await tx.review.create({
      data: { requestId, authorId: session.user.id, providerId: accepted.providerId, rating, comment, status: "PUBLISHED" },
    });
    const agg = await tx.review.aggregate({
      where: { providerId: accepted.providerId, status: "PUBLISHED" },
      _avg: { rating: true },
      _count: true,
    });
    await tx.providerProfile.update({
      where: { id: accepted.providerId },
      data: { ratingAverage: agg._avg.rating ?? 0, ratingCount: agg._count },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
