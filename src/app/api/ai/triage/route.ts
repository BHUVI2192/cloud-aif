import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, imageUrl } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text description is required" }, { status: 400 });
    }

    const ai = getAIProvider();
    const triage = await ai.triageRequest(text, imageUrl);

    return NextResponse.json({ success: true, triage });
  } catch (err: any) {
    console.error("[AI Triage Route Error]:", err);
    return NextResponse.json({ error: err?.message || "Triage failed" }, { status: 500 });
  }
}
