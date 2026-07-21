import { db } from "@/lib/db";
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";

export async function getOrCreateProviderSubscription(providerId: string) {
  let sub = await db.providerSubscription.findUnique({
    where: { providerId },
  });

  if (!sub) {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day free trial

    const referralCode = `SHI-PRO-${Math.floor(100000 + Math.random() * 900000)}`;

    sub = await db.providerSubscription.create({
      data: {
        providerId,
        status: "FREE_TRIAL",
        plan: "TRIAL",
        trialStartedAt: now,
        trialEndsAt: trialEnd,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        monthlyLeadLimit: 30,
        leadsUsedThisPeriod: 0,
        rolloverLeads: 0,
        referralCode,
      },
    });
  }

  if (!sub.referralCode) {
    const referralCode = `SHI-PRO-${Math.floor(100000 + Math.random() * 900000)}`;
    sub = await db.providerSubscription.update({
      where: { id: sub.id },
      data: { referralCode },
    });
  }

  // Update status if trial or period expired
  const now = new Date();
  if (sub.status === "FREE_TRIAL" && sub.trialEndsAt < now) {
    const graceEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3-day grace period
    sub = await db.providerSubscription.update({
      where: { id: sub.id },
      data: {
        status: "GRACE_PERIOD",
        gracePeriodEndsAt: graceEnd,
      },
    });
  } else if (sub.status === "GRACE_PERIOD" && sub.gracePeriodEndsAt && sub.gracePeriodEndsAt < now) {
    sub = await db.providerSubscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });
  }

  return sub;
}

export async function getSubscriptionMetrics(providerId: string) {
  const sub = await getOrCreateProviderSubscription(providerId);

  const [
    periodLeads,
    contactReveals,
    completedJobsCount,
    outcomes,
  ] = await Promise.all([
    db.providerAssignment.count({
      where: {
        providerId,
        createdAt: { gte: sub.currentPeriodStart, lte: sub.currentPeriodEnd },
      },
    }),
    db.platformEvent.count({
      where: {
        providerId,
        eventType: "LEAD_CONTACT_REVEAL",
        createdAt: { gte: sub.currentPeriodStart, lte: sub.currentPeriodEnd },
      },
    }),
    db.providerAssignment.count({
      where: {
        providerId,
        status: "COMPLETED",
        createdAt: { gte: sub.currentPeriodStart, lte: sub.currentPeriodEnd },
      },
    }),
    db.jobOutcome.findMany({
      where: {
        providerId,
        capturedAt: { gte: sub.currentPeriodStart, lte: sub.currentPeriodEnd },
      },
      select: { selfReportedValue: true },
    }),
  ]);

  const selfReportedTotal = outcomes.reduce((acc, o) => acc + o.selfReportedValue, 0);
  const estimatedTicketVal = 450;
  const estimatedTotal = completedJobsCount * estimatedTicketVal;

  const now = new Date();
  const targetEnd = sub.status === "FREE_TRIAL" ? sub.trialEndsAt : sub.currentPeriodEnd;
  const msDiff = targetEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));

  const isRenewalNear = daysRemaining <= 7;

  return {
    subscription: sub,
    periodLeads,
    contactReveals,
    completedJobsCount,
    selfReportedTotal,
    estimatedTotal: Math.max(selfReportedTotal, estimatedTotal),
    daysRemaining,
    isRenewalNear,
  };
}
