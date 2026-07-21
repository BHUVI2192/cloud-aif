import { NextResponse } from "next/server";
import { runMatcherForRequest } from "@/lib/matcher";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.INTERNAL_SYSTEM_SECRET || "dev_secret";

    // Validate internal system authorization token
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized worker access" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, userId } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Missing required requestId parameter" }, { status: 400 });
    }

    console.log(`[WORKER]: Executing background auto-matcher for Request ${requestId}`);
    const result = await runMatcherForRequest(requestId, userId);

    return NextResponse.json({ success: true, requestId, result });
  } catch (error) {
    console.error("[WORKER ERROR]: Failed executing auto-assign worker", error);
    return NextResponse.json({ error: "Internal worker failure" }, { status: 500 });
  }
}
