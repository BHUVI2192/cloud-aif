/**
 * Cloud AIF — Auto-Matching Engine
 *
 * Scores and selects the best-fit providers for a service request using a
 * weighted multi-signal algorithm. Zero external dependencies — pure DB queries.
 *
 * Scoring formula (100 pts total):
 *   Service match    40 pts  — provider offers the requested subservice/category
 *   Area match       30 pts  — provider covers the request's service area
 *   Rating           15 pts  — normalised ratingAverage (0–5 → 0–15)
 *   Capacity          10 pts  — penalise providers with many active jobs
 *   Response rate     5 pts  — leadResponseRate (0–1 → 0–5)
 */

import { db } from "@/lib/db";
import {
  AssignmentSource,
  AssignmentStatus,
  NotificationType,
  RequestStatus,
  UrgencyLevel,
} from "@prisma/client";

const MAX_PROVIDERS_PER_MATCH = 3;    // simultaneous offers per request
const RESPONSE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_MATCH_ATTEMPTS = 3;          // after this → flag needsAdminAttention
const MAX_ACTIVE_JOBS = 5;             // penalise beyond this

export interface MatchResult {
  providerId: string;
  score: number;
  displayName: string;
}

// ---------------------------------------------------------------------------
// CORE SCORING FUNCTION
// ---------------------------------------------------------------------------

export async function scoreProvidersForRequest(
  requestId: string
): Promise<MatchResult[]> {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      assignments: { select: { providerId: true } }, // already tried
    },
  });

  if (!request) return [];

  // Provider IDs already assigned to this request (skip them)
  const alreadyTriedIds = request.assignments.map((a) => a.providerId);

  // Fetch candidates: APPROVED providers who:
  //   1. Offer the category (or exact subservice)
  //   2. Cover the service area
  //   3. Are active (isActive = true)
  //   4. Haven't been tried before for this request
  const candidates = await db.providerProfile.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      id: { notIn: alreadyTriedIds },
      // Must serve the category
      categories: request.categoryId
        ? { some: { categoryId: request.categoryId } }
        : undefined,
      // Must cover the service area (if specified)
      serviceAreas: request.serviceAreaId
        ? { some: { serviceAreaId: request.serviceAreaId } }
        : undefined,
    },
    include: {
      subservices: request.subserviceId
        ? { where: { subserviceId: request.subserviceId } }
        : false,
      assignments: {
        where: {
          status: { in: ["PENDING", "ACCEPTED"] },
        },
        select: { id: true },
      },
    },
  });

  if (candidates.length === 0) return [];

  const scored: MatchResult[] = candidates.map((p) => {
    let score = 0;

    // 1. Service match (40 pts)
    //    +40 if provider has exact subservice; +30 if only category match
    if (request.subserviceId) {
      const hasSub =
        Array.isArray(p.subservices) && p.subservices.length > 0;
      score += hasSub ? 40 : 30;
    } else {
      score += 40; // category-only request — any category provider qualifies
    }

    // 2. Rating (15 pts)
    //    Normalise 0–5 star avg to 0–15
    score += (p.ratingAverage / 5) * 15;

    // 3. Capacity (10 pts)
    //    Full 10 pts if 0 active jobs; drops linearly to 0 at MAX_ACTIVE_JOBS
    const activeJobs = p.assignments.length;
    const capacityScore = Math.max(0, 10 - (activeJobs / MAX_ACTIVE_JOBS) * 10);
    score += capacityScore;

    // 4. Response rate (5 pts)
    score += p.leadResponseRate * 5;

    // 5. Emergency bonus — bump top providers for EMERGENCY urgency
    if (request.urgency === UrgencyLevel.EMERGENCY) {
      score += p.ratingAverage >= 4 ? 10 : 0;
    }

    return { providerId: p.id, score, displayName: p.displayName };
  });

  // Sort descending by score and return top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PROVIDERS_PER_MATCH);
}

// ---------------------------------------------------------------------------
// MAIN MATCH + ASSIGN FUNCTION  (called on submit + retries)
// ---------------------------------------------------------------------------

export async function runMatcherForRequest(
  requestId: string,
  triggeredByUserId?: string
): Promise<{ matched: number; flaggedForAdmin: boolean }> {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) return { matched: 0, flaggedForAdmin: false };

  // Only match requests in SUBMITTED or MATCHING state
  if (
    request.status !== RequestStatus.SUBMITTED &&
    request.status !== RequestStatus.MATCHING
  ) {
    return { matched: 0, flaggedForAdmin: false };
  }

  const topProviders = await scoreProvidersForRequest(requestId);

  if (topProviders.length === 0) {
    // No providers found — increment attempts, maybe flag for admin
    const newAttempts = request.matchAttempts + 1;
    const flagAdmin = newAttempts >= MAX_MATCH_ATTEMPTS;

    await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        matchAttempts: newAttempts,
        lastMatchedAt: new Date(),
        needsAdminAttention: flagAdmin,
      },
    });

    return { matched: 0, flaggedForAdmin: flagAdmin };
  }

  // Create assignments and notifications in a single transaction
  const now = new Date();
  await db.$transaction(async (tx) => {
    for (const p of topProviders) {
      // Upsert-safe: skip if this provider was already tried
      const existing = await tx.providerAssignment.findUnique({
        where: { requestId_providerId: { requestId, providerId: p.providerId } },
      });
      if (existing) continue;

      await tx.providerAssignment.create({
        data: {
          requestId,
          providerId: p.providerId,
          status: AssignmentStatus.PENDING,
          source: AssignmentSource.SYSTEM,
          createdById: triggeredByUserId ?? null,
        },
      });

      // Fetch provider userId for notification
      const providerUser = await tx.providerProfile.findUnique({
        where: { id: p.providerId },
        select: { userId: true },
      });

      if (providerUser) {
        await tx.notification.create({
          data: {
            userId: providerUser.userId,
            type: NotificationType.REQUEST_ASSIGNED,
            title: "New Job Available 🔔",
            body: `A customer needs "${request.title}" in ${request.locality ?? "your area"}. Accept before it expires!`,
          },
        });
      }
    }

    // Move request to MATCHING state + log
    if (request.status === RequestStatus.SUBMITTED) {
      await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.MATCHING },
      });
      await tx.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: RequestStatus.SUBMITTED,
          toStatus: RequestStatus.MATCHING,
          changedById: triggeredByUserId ?? null,
          note: `Auto-matched with ${topProviders.length} provider(s): ${topProviders.map((p) => p.displayName).join(", ")}`,
        },
      });
    }

    await tx.serviceRequest.update({
      where: { id: requestId },
      data: {
        matchAttempts: { increment: 1 },
        lastMatchedAt: now,
        needsAdminAttention: false,
      },
    });
  });

  return { matched: topProviders.length, flaggedForAdmin: false };
}

// ---------------------------------------------------------------------------
// EXPIRE STALE PENDING ASSIGNMENTS + RETRY
// Called by the /api/system/auto-assign cron endpoint
// ---------------------------------------------------------------------------

export async function processExpiredAssignments(): Promise<{
  expired: number;
  retriedRequests: number;
  flagged: number;
}> {
  const cutoff = new Date(Date.now() - RESPONSE_WINDOW_MS);

  // 1. Find PENDING assignments older than the response window
  const stale = await db.providerAssignment.findMany({
    where: {
      status: AssignmentStatus.PENDING,
      assignedAt: { lt: cutoff },
    },
    select: { id: true, requestId: true },
  });

  if (stale.length === 0) return { expired: 0, retriedRequests: 0, flagged: 0 };

  // 2. Mark them EXPIRED
  await db.providerAssignment.updateMany({
    where: { id: { in: stale.map((s) => s.id) } },
    data: { status: AssignmentStatus.EXPIRED },
  });

  // 3. For each affected request (deduplicated), check if it still needs matching
  const uniqueRequestIds = [...new Set(stale.map((s) => s.requestId))];
  let retriedRequests = 0;
  let flagged = 0;

  for (const requestId of uniqueRequestIds) {
    // Check if the request still has an active (ACCEPTED) assignment
    const active = await db.providerAssignment.findFirst({
      where: {
        requestId,
        status: { in: [AssignmentStatus.ACCEPTED, AssignmentStatus.PENDING] },
      },
    });

    if (!active) {
      // No active assignment — re-run matcher
      const result = await runMatcherForRequest(requestId);
      retriedRequests++;
      if (result.flaggedForAdmin) flagged++;
    }
  }

  return { expired: stale.length, retriedRequests, flagged };
}

// ---------------------------------------------------------------------------
// ANTI-SPAM: Rate limit checks (no OTP needed — uses account-level rules)
// ---------------------------------------------------------------------------

export async function checkRequestRateLimit(
  userId: string,
  categoryId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const [activeCount, recentSameCategory] = await Promise.all([
    // Max 3 active (non-completed/cancelled) requests per user
    db.serviceRequest.count({
      where: {
        customerId: userId,
        status: {
          notIn: ["COMPLETED", "CANCELLED", "EXPIRED"],
        },
      },
    }),
    // Can't submit same category request within 24 hours
    db.serviceRequest.findFirst({
      where: {
        customerId: userId,
        categoryId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true, createdAt: true },
    }),
  ]);

  if (activeCount >= 3) {
    return {
      allowed: false,
      reason:
        "You already have 3 active service requests. Please wait for one to be completed or cancel it before submitting a new one.",
    };
  }

  if (recentSameCategory) {
    return {
      allowed: false,
      reason:
        "You already submitted a similar request in the last 24 hours. Check your existing request or wait before submitting again.",
    };
  }

  return { allowed: true };
}
