import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processExpiredAssignments, runMatcherForRequest } from "@/lib/matcher";

/**
 * Auto-assign cron endpoint.
 * Call this every 30 minutes via Vercel Cron, a GitHub Action, or cron-job.org (free).
 *
 * Example Vercel cron config in vercel.json:
 *   { "crons": [{ "path": "/api/system/auto-assign", "schedule": "0/30 * * * *" }] }
 *
 * Protected by a shared secret to prevent abuse.
 * Pass as: GET /api/system/auto-assign  with header  x-cron-secret: <CRON_SECRET>
 */

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify cron secret
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // 1. Expire stale PENDING assignments and retry matching
  const expiry = await processExpiredAssignments();
  results.expiry = expiry;

  // 2. Pick up any SUBMITTED requests that were never matched
  //    (edge case: matcher failed silently on submit)
  const unmatchedRequests = await db.serviceRequest.findMany({
    where: {
      status: "SUBMITTED",
      matchAttempts: 0,
      createdAt: { lt: new Date(Date.now() - 5 * 60 * 1000) }, // older than 5 min
    },
    select: { id: true },
    take: 20,
  });

  let bootstrapped = 0;
  for (const r of unmatchedRequests) {
    await runMatcherForRequest(r.id);
    bootstrapped++;
  }
  results.bootstrapped = bootstrapped;

  // 3. Return count of requests still needing admin attention
  const pendingAttention = await db.serviceRequest.count({
    where: { needsAdminAttention: true, status: { in: ["SUBMITTED", "MATCHING"] } },
  });
  results.pendingAdminAttention = pendingAttention;

  return NextResponse.json({ ok: true, ...results });
}
