import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");

    if (!providerId) {
      return NextResponse.json({ error: "providerId parameter is required" }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { providerId, status: "PUBLISHED" },
      select: { rating: true, comment: true },
      take: 20,
    });

    const ai = getAIProvider();
    const summary = await ai.summarizeReviews(reviews);

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    console.error("[AI Review Summary Error]:", err);
    return NextResponse.json({ error: err?.message || "Summary failed" }, { status: 500 });
  }
}
