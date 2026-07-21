import { db } from "@/lib/db";
import { processExpiredAssignments } from "@/lib/matcher";

export async function enqueueJob(
  type: string,
  payload?: any,
  scheduledFor: Date = new Date(),
  maxAttempts: number = 3
) {
  return db.scheduledJob.create({
    data: {
      type,
      payload: payload ?? undefined,
      scheduledFor,
      maxAttempts,
      status: "PENDING",
    },
  });
}

export async function processNextJobs(batchSize: number = 10) {
  const now = new Date();

  // Find due PENDING jobs
  const jobs = await db.scheduledJob.findMany({
    where: {
      status: "PENDING",
      scheduledFor: { lte: now },
    },
    take: batchSize,
    orderBy: { scheduledFor: "asc" },
  });

  if (jobs.length === 0) return { processed: 0, failed: 0 };

  let processedCount = 0;
  let failedCount = 0;

  for (const job of jobs) {
    // Acquire optimistic lock on job
    const updated = await db.scheduledJob.updateMany({
      where: { id: job.id, status: "PENDING" },
      data: { status: "PROCESSING", attempts: { increment: 1 } },
    });

    if (updated.count === 0) continue; // Concurrency lock skip

    try {
      if (job.type === "EXPIRE_STALE_ASSIGNMENTS") {
        await processExpiredAssignments();
      } else if (job.type === "CLEANUP_STALE_PINGS") {
        // Purge GPS pings older than 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        await db.providerLocationPing.deleteMany({
          where: { capturedAt: { lt: sevenDaysAgo } },
        });
      } else if (job.type === "SEND_RENEWAL_REMINDERS") {
        const threeDaysAhead = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const expiringSubs = await db.providerSubscription.findMany({
          where: {
            currentPeriodEnd: { lte: threeDaysAhead },
            status: { in: ["FREE_TRIAL", "ACTIVE"] },
          },
          include: { provider: { select: { userId: true, displayName: true } } },
        });
        for (const s of expiringSubs) {
          await db.notification.create({
            data: {
              userId: s.provider.userId,
              type: "SYSTEM_ANNOUNCEMENT",
              title: "Subscription Renewal Reminder",
              body: `Hi ${s.provider.displayName}, your Cloud AIF subscription plan ends soon. Review your lead earnings and renew to stay active.`,
            },
          });
        }
      } else if (job.type === "SEND_REENGAGEMENT_NUDGES") {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const inactiveUsers = await db.user.findMany({
          where: {
            role: "CUSTOMER",
            serviceRequests: { none: { createdAt: { gte: fourteenDaysAgo } } },
          },
          take: 50,
        });
        for (const u of inactiveUsers) {
          await db.notification.create({
            data: {
              userId: u.id,
              type: "SYSTEM_ANNOUNCEMENT",
              title: "Need help around your home?",
              body: "Book trusted local plumbers, electricians, and technicians in Shivamogga with a 7-day guarantee.",
            },
          });
        }
      } else {
        console.warn(`[Job Scheduler] Unknown job type: ${job.type}`);
      }

      await db.scheduledJob.update({
        where: { id: job.id },
        data: { status: "COMPLETED", processedAt: new Date() },
      });
      processedCount++;
    } catch (err: any) {
      failedCount++;
      const isFinalAttempt = job.attempts + 1 >= job.maxAttempts;
      await db.scheduledJob.update({
        where: { id: job.id },
        data: {
          status: isFinalAttempt ? "FAILED" : "PENDING",
          failedAt: isFinalAttempt ? new Date() : undefined,
          lastError: err?.message || String(err),
          // Retry backoff (2 minutes)
          scheduledFor: isFinalAttempt ? job.scheduledFor : new Date(Date.now() + 2 * 60 * 1000),
        },
      });
    }
  }

  return { processed: processedCount, failed: failedCount };
}
