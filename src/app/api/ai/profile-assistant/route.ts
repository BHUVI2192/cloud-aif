import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryName, experienceYears, rawBio } = body;

    if (!categoryName) {
      return NextResponse.json({ error: "categoryName is required" }, { status: 400 });
    }

    const ai = getAIProvider();
    const result = await ai.generateProfileAssistant({
      categoryName,
      experienceYears: Number(experienceYears) || 3,
      rawBio,
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("[AI Profile Assistant Error]:", err);
    return NextResponse.json({ error: err?.message || "Profile assistant failed" }, { status: 500 });
  }
}
