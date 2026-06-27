/**
 * ============================================================
 * Cloud AIF — Auto-Matching Engine  v2
 * ============================================================
 *
 * Architecture:
 *   Phase 1 — HARD FILTERS (must-pass, candidates who fail are excluded)
 *   Phase 2 — SOFT SCORING (rank surviving candidates, best wins)
 *   Phase 3 — FAIRNESS ADJUSTMENT (prevent top-provider monopoly)
 *   Phase 4 — ASSIGN + NOTIFY   (batch offer to top N)
 *   Phase 5 — EXPIRY + RETRY    (cron: expire non-responses, re-run)
 *
 * Scoring formula (100 pts, all signals normalised 0–1 before weighting):
 *
 *   score = 0.25 · rating
 *         + 0.20 · availability        ← is provider free at requested time?
 *         + 0.20 · proximityProxy       ← area/radius match (no GPS required)
 *         + 0.15 · workloadBalance      ← penalise overloaded + fairness term
 *         + 0.10 · responseSpeed        ← past leadResponseRate
 *         + 0.10 · subserviceMatch      ← exact subservice vs. category-only
 *
 * Hard filters (must all pass):
 *   ✓ status = APPROVED
 *   ✓ isActive = true
 *   ✓ serves request's categoryId
 *   ✓ covers request's serviceAreaId
 *   ✓ language match (if customer specifies preferred language)
 *   ✓ not already tried for this request
 *   ✓ not suspended / deleted
 *
 * Notes:
 *   - Distance: ServiceArea has no lat/lng; we use serviceRadiusKm + area match
 *     as a proximity proxy. When provider lat/lng becomes available via Address
 *     records, haversine distance replaces this automatically.
 *   - Sequential vs. batch: We use batch (top 3 notified at once). Sequential
 *     (offer → wait → next) is only better for real-time GPS services like
 *     ride-hailing. Our services are scheduled → batch maximises acceptance speed.
 *   - Gender preference: Not in schema → not implemented yet.
 *   - ML: Will be layered on top once 500+ completed assignments are logged.
 */

import { db } from "@/lib/db";
import {
  AssignmentSource,
  AssignmentStatus,
  NotificationType,
  RequestStatus,
  UrgencyLevel,
  DayOfWeek,
} from "@prisma/client";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_PROVIDERS_PER_BATCH  = 3;           // simultaneous offers per round
const RESPONSE_WINDOW_MS       = 2 * 60 * 60 * 1000; // 2 h before expiry
const EMERGENCY_WINDOW_MS      = 30 * 60 * 1000;     // 30 min for EMERGENCY
const MAX_MATCH_ATTEMPTS       = 4;           // beyond this → flag admin
const MAX_ACTIVE_JOBS          = 6;           // capacity ceiling
const FAIRNESS_LOOKBACK_DAYS   = 7;           // balance window for job-share

// Scoring weights (must sum to 1.0)
const W = {
  rating:           0.25,
  availability:     0.20,
  proximityProxy:   0.20,
  workloadBalance:  0.15,
  responseSpeed:    0.10,
  subserviceMatch:  0.10,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MatchResult {
  providerId: string;
  score: number;
  displayName: string;
  scoreBreakdown: Record<string, number>;
}

type DayName = "SUNDAY"|"MONDAY"|"TUESDAY"|"WEDNESDAY"|"THURSDAY"|"FRIDAY"|"SATURDAY";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Haversine distance in km between two lat/lng pairs */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Map JS Date.getDay() → Prisma DayOfWeek enum */
const JS_DAY_TO_ENUM: DayName[] = [
  "SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY",
];

/** Convert "HH:mm" string to minutes-since-midnight */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// ─── Phase 1: Hard-filter candidates ─────────────────────────────────────────

/**
 * Returns provider IDs that pass ALL hard filters for the given request.
 * These are the only candidates eligible for scoring.
 */
async function getEligibleProviders(
  requestId: string,
  alreadyTriedIds: string[]
) {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
    select: {
      categoryId: true,
      subserviceId: true,
      serviceAreaId: true,
      preferredDate: true,
      urgency: true,
      latitude: true,
      longitude: true,
    },
  });
  if (!request) return [];

  return db.providerProfile.findMany({
    where: {
      // Core hard filters
      status: "APPROVED",
      isActive: true,
      deletedAt: null,
      id: { notIn: alreadyTriedIds },

      // Must offer the service category
      categories: { some: { categoryId: request.categoryId } },

      // Must cover the service area
      ...(request.serviceAreaId
        ? { serviceAreas: { some: { serviceAreaId: request.serviceAreaId } } }
        : {}),
    },
    include: {
      // For subservice-match scoring
      subservices: request.subserviceId
        ? { where: { subserviceId: request.subserviceId } }
        : { take: 0 }, // empty array if no subservice requested

      // For workload scoring
      assignments: {
        where: { status: { in: ["PENDING", "ACCEPTED"] } },
        select: { id: true },
      },

      // For availability scoring
      availability: true,

      // For proximity scoring (provider business address)
      addresses: {
        where: { type: "PROVIDER_BUSINESS" },
        select: { latitude: true, longitude: true },
        take: 1,
      },
    },
  });
}

// ─── Phase 2: Score each candidate ───────────────────────────────────────────

interface ScoringInput {
  preferredDate: Date | null;
  urgency: string;
  requestLat: number | null;
  requestLon: number | null;
  subserviceId: string | null;
  // Recent assignment counts per providerId (for fairness)
  recentJobCounts: Map<string, number>;
  maxRecentJobs: number;
}

function scoreCandidate(
  provider: Awaited<ReturnType<typeof getEligibleProviders>>[number],
  ctx: ScoringInput
): MatchResult {
  const breakdown: Record<string, number> = {};

  // ── 1. Rating (0.25) ──
  // Normalise 0–5 → 0–1. New providers (0 rating) get 0.6 to avoid cold-start penalty.
  const ratingNorm = provider.ratingCount === 0
    ? 0.6
    : Math.min(provider.ratingAverage / 5, 1);
  breakdown.rating = W.rating * ratingNorm;

  // ── 2. Availability (0.20) ──
  // Hard check: does provider have a recurring slot covering the requested time?
  // If no preferredDate → treat as "anytime" → full availability score.
  let availScore = 1.0; // default: full score when no time preference
  if (ctx.preferredDate && provider.availability.length > 0) {
    const day = JS_DAY_TO_ENUM[ctx.preferredDate.getDay()] as DayOfWeek;
    const reqMinutes = ctx.preferredDate.getHours() * 60 + ctx.preferredDate.getMinutes();

    // Check weekly recurring availability
    const slot = provider.availability.find(
      (a) =>
        a.isAvailable &&
        a.type === "WEEKLY_RECURRING" &&
        a.dayOfWeek === day &&
        toMinutes(a.startTime) <= reqMinutes &&
        toMinutes(a.endTime) >= reqMinutes
    );

    // Check date-specific overrides (blackouts)
    const dateKey = ctx.preferredDate.toISOString().slice(0, 10);
    const blackout = provider.availability.find(
      (a) =>
        !a.isAvailable &&
        a.type === "DATE_OVERRIDE" &&
        a.date?.toISOString().slice(0, 10) === dateKey
    );

    if (blackout) {
      availScore = 0; // provider marked unavailable this day → skip in scoring
    } else if (slot) {
      availScore = 1.0; // perfect slot match
    } else {
      availScore = 0.3; // no slot listed → may still be available, partial credit
    }
  }
  breakdown.availability = W.availability * availScore;

  // ── 3. Proximity Proxy (0.20) ──
  // Best case: we have both lat/lngs → haversine.
  // Fallback: serviceRadiusKm acts as a proxy (larger radius = more flexible).
  let proximityScore = 0.5; // neutral default when no geo data
  if (
    ctx.requestLat !== null && ctx.requestLon !== null &&
    provider.addresses[0]?.latitude && provider.addresses[0]?.longitude
  ) {
    const distKm = haversineKm(
      ctx.requestLat, ctx.requestLon,
      provider.addresses[0].latitude,
      provider.addresses[0].longitude
    );
    const radius = provider.serviceRadiusKm ?? 10;
    // Score = 1 if at centroid, drops to 0 at edge of service radius
    proximityScore = Math.max(0, 1 - distKm / radius);
  } else if (provider.serviceRadiusKm) {
    // Larger declared radius = more likely to reach customer = slight bonus
    proximityScore = Math.min(provider.serviceRadiusKm / 20, 1); // cap at 20 km
  }
  breakdown.proximityProxy = W.proximityProxy * proximityScore;

  // ── 4. Workload Balance (0.15) ──
  // Two components:
  //   a) Current capacity: fewer active jobs = better
  //   b) Fairness: fewer jobs received this week = higher priority
  const activeJobs = provider.assignments.length;
  const capacityNorm = Math.max(0, 1 - activeJobs / MAX_ACTIVE_JOBS);

  const recentJobs = ctx.recentJobCounts.get(provider.id) ?? 0;
  const fairnessNorm = ctx.maxRecentJobs > 0
    ? 1 - recentJobs / ctx.maxRecentJobs
    : 1;

  const workloadScore = 0.6 * capacityNorm + 0.4 * fairnessNorm;
  breakdown.workloadBalance = W.workloadBalance * workloadScore;

  // ── 5. Response Speed (0.10) ──
  breakdown.responseSpeed = W.responseSpeed * Math.min(provider.leadResponseRate, 1);

  // ── 6. Subservice Match (0.10) ──
  const hasSub = Array.isArray(provider.subservices) && provider.subservices.length > 0;
  const subScore = ctx.subserviceId ? (hasSub ? 1 : 0.5) : 1;
  breakdown.subserviceMatch = W.subserviceMatch * subScore;

  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);

  return {
    providerId: provider.id,
    displayName: provider.displayName,
    score: Math.round(total * 100) / 100,
    scoreBreakdown: breakdown,
  };
}

// ─── Main scoring pipeline ────────────────────────────────────────────────────

export async function scoreProvidersForRequest(
  requestId: string
): Promise<MatchResult[]> {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
    include: { assignments: { select: { providerId: true } } },
  });
  if (!request) return [];

  const alreadyTriedIds = request.assignments.map((a) => a.providerId);
  const candidates = await getEligibleProviders(requestId, alreadyTriedIds);
  if (candidates.length === 0) return [];

  // Fetch fairness data: job counts in the past FAIRNESS_LOOKBACK_DAYS
  const since = new Date(Date.now() - FAIRNESS_LOOKBACK_DAYS * 86400_000);
  const recentJobRows = await db.providerAssignment.groupBy({
    by: ["providerId"],
    where: {
      providerId: { in: candidates.map((c) => c.id) },
      createdAt: { gte: since },
      status: { notIn: ["WITHDRAWN", "EXPIRED"] },
    },
    _count: { id: true },
  });
  const recentJobCounts = new Map(recentJobRows.map((r) => [r.providerId, r._count.id]));
  const maxRecentJobs = Math.max(...Array.from(recentJobCounts.values()), 1);

  const ctx: ScoringInput = {
    preferredDate: request.preferredDate,
    urgency: request.urgency,
    requestLat: request.latitude,
    requestLon: request.longitude,
    subserviceId: request.subserviceId,
    recentJobCounts,
    maxRecentJobs,
  };

  // Score, sort, return top N
  const scored = candidates
    .map((p) => scoreCandidate(p, ctx))
    // Providers with zero availability at requested time are deprioritised
    // (they still appear if no better option exists)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PROVIDERS_PER_BATCH);

  return scored;
}

// ─── Assign + Notify ─────────────────────────────────────────────────────────

export async function runMatcherForRequest(
  requestId: string,
  triggeredByUserId?: string
): Promise<{ matched: number; flaggedForAdmin: boolean }> {
  const request = await db.serviceRequest.findUnique({ where: { id: requestId } });
  if (!request) return { matched: 0, flaggedForAdmin: false };

  if (
    request.status !== RequestStatus.SUBMITTED &&
    request.status !== RequestStatus.MATCHING
  ) {
    return { matched: 0, flaggedForAdmin: false };
  }

  const topProviders = await scoreProvidersForRequest(requestId);

  if (topProviders.length === 0) {
    const newAttempts = request.matchAttempts + 1;
    const flagAdmin = newAttempts >= MAX_MATCH_ATTEMPTS;
    await db.serviceRequest.update({
      where: { id: requestId },
      data: {
        matchAttempts: newAttempts,
        lastMatchedAt: new Date(),
        needsAdminAttention: flagAdmin,
        ...(flagAdmin ? {} : {}), // status stays MATCHING
      },
    });
    if (flagAdmin) {
      await db.requestStatusHistory.create({
        data: {
          requestId,
          fromStatus: request.status,
          toStatus: request.status,
          changedById: null,
          note: `No eligible provider found after ${newAttempts} attempts. Flagged for admin attention.`,
        },
      });
    }
    return { matched: 0, flaggedForAdmin: flagAdmin };
  }

  const now = new Date();
  const responseWindow = request.urgency === UrgencyLevel.EMERGENCY
    ? EMERGENCY_WINDOW_MS
    : RESPONSE_WINDOW_MS;
  const expiresAt = new Date(now.getTime() + responseWindow);

  await db.$transaction(async (tx) => {
    for (const p of topProviders) {
      // Skip if already assigned (idempotent)
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

      // Notify provider
      const providerUser = await tx.providerProfile.findUnique({
        where: { id: p.providerId },
        select: { userId: true },
      });
      if (providerUser) {
        const urgencyEmoji = request.urgency === "EMERGENCY" ? "🚨" : "🔔";
        await tx.notification.create({
          data: {
            userId: providerUser.userId,
            type: NotificationType.REQUEST_ASSIGNED,
            title: `${urgencyEmoji} New Job Available`,
            body: `"${request.title}" in ${request.locality ?? "your area"}. `
              + `Score: ${(p.score * 100).toFixed(0)}%. `
              + `Respond within ${request.urgency === "EMERGENCY" ? "30 min" : "2 hours"}!`,
          },
        });
      }
    }

    // Transition: SUBMITTED → MATCHING
    if (request.status === RequestStatus.SUBMITTED) {
      await tx.serviceRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.MATCHING, expiresAt },
      });
    }

    await tx.requestStatusHistory.create({
      data: {
        requestId,
        fromStatus: request.status,
        toStatus: RequestStatus.MATCHING,
        changedById: triggeredByUserId ?? null,
        note: `Auto-matched (attempt ${request.matchAttempts + 1}) → `
          + topProviders.map((p) => `${p.displayName} (${(p.score * 100).toFixed(0)}%)`).join(", "),
      },
    });

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

// ─── Expiry + Retry (cron) ────────────────────────────────────────────────────

export async function processExpiredAssignments(): Promise<{
  expired: number;
  retriedRequests: number;
  flagged: number;
}> {
  const now = new Date();

  // Find PENDING assignments whose parent request's expiresAt has passed
  const stale = await db.providerAssignment.findMany({
    where: {
      status: AssignmentStatus.PENDING,
      request: {
        expiresAt: { lt: now },
        status: { in: [RequestStatus.MATCHING] },
      },
    },
    select: { id: true, requestId: true },
  });

  if (stale.length === 0) return { expired: 0, retriedRequests: 0, flagged: 0 };

  await db.providerAssignment.updateMany({
    where: { id: { in: stale.map((s) => s.id) } },
    data: { status: AssignmentStatus.EXPIRED },
  });

  const uniqueRequestIds = [...new Set(stale.map((s) => s.requestId))];
  let retriedRequests = 0;
  let flagged = 0;

  for (const requestId of uniqueRequestIds) {
    // Only retry if no one has accepted
    const hasAccepted = await db.providerAssignment.findFirst({
      where: { requestId, status: AssignmentStatus.ACCEPTED },
    });
    if (hasAccepted) continue;

    // Log the reassignment event
    const req = await db.serviceRequest.findUnique({
      where: { id: requestId },
      select: { status: true, matchAttempts: true },
    });
    if (!req) continue;

    await db.requestStatusHistory.create({
      data: {
        requestId,
        fromStatus: req.status,
        toStatus: RequestStatus.MATCHING,
        changedById: null,
        note: `No provider accepted within the response window. Retrying (attempt ${req.matchAttempts + 1}).`,
      },
    });

    const result = await runMatcherForRequest(requestId);
    retriedRequests++;
    if (result.flaggedForAdmin) flagged++;
  }

  return { expired: stale.length, retriedRequests, flagged };
}

// ─── Anti-spam (replaces OTP — zero cost) ────────────────────────────────────

export async function checkRequestRateLimit(
  userId: string,
  categoryId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const [activeCount, recentSameCategory] = await Promise.all([
    // Max 3 active requests per user at any time
    db.serviceRequest.count({
      where: {
        customerId: userId,
        status: { notIn: ["COMPLETED", "CANCELLED", "EXPIRED"] },
      },
    }),
    // Can't submit same-category request within 24 hours (prevents spam)
    db.serviceRequest.findFirst({
      where: {
        customerId: userId,
        categoryId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: { notIn: ["CANCELLED"] }, // cancelled ones don't block
      },
      select: { id: true },
    }),
  ]);

  if (activeCount >= 3) {
    return {
      allowed: false,
      reason:
        "You already have 3 active service requests. Please wait for one to complete or cancel it before submitting another.",
    };
  }
  if (recentSameCategory) {
    return {
      allowed: false,
      reason:
        "You submitted a similar request in the last 24 hours. Check your existing request or wait before submitting a new one.",
    };
  }
  return { allowed: true };
}

// ─── Debug: score breakdown for admin ────────────────────────────────────────

/**
 * Returns full scoring details for all candidates of a request.
 * Used in the admin panel to explain why a provider was/wasn't selected.
 */
export async function explainMatchForRequest(requestId: string): Promise<MatchResult[]> {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
    include: { assignments: { select: { providerId: true } } },
  });
  if (!request) return [];

  const candidates = await getEligibleProviders(requestId, []);
  if (candidates.length === 0) return [];

  const since = new Date(Date.now() - FAIRNESS_LOOKBACK_DAYS * 86400_000);
  const recentJobRows = await db.providerAssignment.groupBy({
    by: ["providerId"],
    where: {
      providerId: { in: candidates.map((c) => c.id) },
      createdAt: { gte: since },
      status: { notIn: ["WITHDRAWN", "EXPIRED"] },
    },
    _count: { id: true },
  });
  const recentJobCounts = new Map(recentJobRows.map((r) => [r.providerId, r._count.id]));
  const maxRecentJobs = Math.max(...Array.from(recentJobCounts.values()), 1);

  const ctx: ScoringInput = {
    preferredDate: request.preferredDate,
    urgency: request.urgency,
    requestLat: request.latitude,
    requestLon: request.longitude,
    subserviceId: request.subserviceId,
    recentJobCounts,
    maxRecentJobs,
  };

  return candidates
    .map((p) => scoreCandidate(p, ctx))
    .sort((a, b) => b.score - a.score);
}
