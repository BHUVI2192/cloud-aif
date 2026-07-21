import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

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
    const { rating, comment, punctuality, behavior, serviceQuality, valueForMoney } = body;

    const request = await db.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          where: { status: "ACCEPTED" },
          include: { provider: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden. Only request owner can submit review" }, { status: 403 });
    }

    const assignedProvider = request.assignments[0]?.provider;
    if (!assignedProvider) {
      return NextResponse.json({ error: "No assigned provider found for this request" }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        requestId: params.id,
        authorId: session.user.id,
        providerId: assignedProvider.id,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        comment: comment || null,
        punctuality: punctuality ? Number(punctuality) : 5,
        professionalism: behavior ? Number(behavior) : 5,
        quality: serviceQuality ? Number(serviceQuality) : 5,
        valueForMoney: valueForMoney ? Number(valueForMoney) : 5,
        ratingBreakdown: {
          create: {
            punctuality: punctuality ? Number(punctuality) : 5,
            behavior: behavior ? Number(behavior) : 5,
            serviceQuality: serviceQuality ? Number(serviceQuality) : 5,
            valueForMoney: valueForMoney ? Number(valueForMoney) : 5,
          },
        },
      },
    });

    // Update provider's denormalized rating metrics
    const agg = await db.review.aggregate({
      where: { providerId: assignedProvider.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    await db.providerProfile.update({
      where: { id: assignedProvider.id },
      data: {
        ratingAverage: agg._avg.rating || 5,
        ratingCount: agg._count.id || 1,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[ratings-api] Error submitting ratings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
