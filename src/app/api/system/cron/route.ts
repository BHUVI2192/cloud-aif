import { NextResponse } from "next/server";
import { enqueueJob, processNextJobs } from "@/lib/job-scheduler";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET || process.env.INTERNAL_SYSTEM_SECRET || "dev_secret";

    // Validate cron secret in production
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    // Auto-enqueue periodic maintenance tasks if not pending
    await enqueueJob("EXPIRE_STALE_ASSIGNMENTS", {}, new Date(), 3);
    await enqueueJob("CLEANUP_STALE_PINGS", {}, new Date(), 1);

    // Process pending background jobs
    const result = await processNextJobs(20);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      jobsResult: result,
    });
  } catch (err: any) {
    console.error("[Cron Handler Error]:", err);
    return NextResponse.json({ error: err?.message || "Internal cron error" }, { status: 500 });
  }
}
