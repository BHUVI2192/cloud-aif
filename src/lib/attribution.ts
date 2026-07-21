import { db } from "@/lib/db";
import { PlatformEventType, UserRole } from "@prisma/client";

export interface RecordEventOptions {
  actorId?: string;
  actorRole?: UserRole;
  requestId?: string;
  providerId?: string;
  customerId?: string;
  subserviceId?: string;
  serviceAreaId?: string;
  metadata?: Record<string, any>;
}

export async function recordPlatformEvent(eventType: PlatformEventType, options: RecordEventOptions = {}) {
  try {
    return await db.platformEvent.create({
      data: {
        eventType,
        actorId: options.actorId,
        actorRole: options.actorRole,
        requestId: options.requestId,
        providerId: options.providerId,
        customerId: options.customerId,
        subserviceId: options.subserviceId,
        serviceAreaId: options.serviceAreaId,
        metadata: options.metadata ?? undefined,
      },
    });
  } catch (err) {
    console.error(`[PlatformEvent Error logging ${eventType}]:`, err);
    return null;
  }
}

export async function getProviderRoiMetrics(providerId: string) {
  const [
    impressionsCount,
    profileViewsCount,
    contactRevealsCount,
    matchedAssignmentsCount,
    completedJobsCount,
    provider,
  ] = await Promise.all([
    db.platformEvent.count({ where: { providerId, eventType: "LEAD_IMPRESSION" } }),
    db.platformEvent.count({ where: { providerId, eventType: "LEAD_PROFILE_VIEW" } }),
    db.platformEvent.count({ where: { providerId, eventType: "LEAD_CONTACT_REVEAL" } }),
    db.providerAssignment.count({ where: { providerId } }),
    db.providerAssignment.count({ where: { providerId, status: "COMPLETED" } }),
    db.providerProfile.findUnique({
      where: { id: providerId },
      select: { inspectionFee: true, jobsCompleted: true, createdAt: true },
    }),
  ]);

  const estimatedJobs = Math.max(completedJobsCount, provider?.jobsCompleted || 0);
  const avgJobValue = 450; // Average Shivamogga service ticket value in INR
  const estimatedRevenueGenerated = estimatedJobs * avgJobValue;

  return {
    impressionsCount,
    profileViewsCount,
    contactRevealsCount,
    matchedAssignmentsCount,
    completedJobsCount: estimatedJobs,
    estimatedRevenueGenerated,
    memberSince: provider?.createdAt || new Date(),
  };
}
