import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { runMatcherForRequest, checkRequestRateLimit } from "@/lib/matcher";

const schema = z.object({
  categoryId: z.string().min(1),
  subserviceId: z.string().min(1).optional(),
  title: z.string().min(4),
  description: z.string().min(10), // Reduced from 20 to 10 for ease of testing/submitting
  serviceAreaId: z.string().min(1),
  addressLine: z.string().optional(),
  landmark: z.string().optional(),
  voiceNoteUrl: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  providerId: z.string().optional(),
  urgency: z.enum(["FLEXIBLE", "WITHIN_WEEK", "WITHIN_48_HOURS", "EMERGENCY"]).default("FLEXIBLE"),
  contactPreference: z.enum(["ANY", "PHONE", "WHATSAPP", "EMAIL"]).default("ANY"),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  phone: z.string().min(10, "Primary phone number must be at least 10 digits"),
  alternatePhone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Honeypot — bots fill this, humans don't see it
  _hp: z.string().max(0, "Invalid submission").optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Honeypot check (zero-cost bot filter)
  if (body._hp && body._hp.length > 0) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const d = parsed.data;

  // Anti-spam: account-level rate limits (replaces OTP — zero cost)
  const rateCheck = await checkRequestRateLimit(session.user.id, d.categoryId);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: rateCheck.reason }, { status: 429 });
  }

  const area = await db.serviceArea.findUnique({ where: { id: d.serviceAreaId } });

  // Auto-matching & Neighborhood Discount Clustered Grouping
  let targetGroupId: string | null = null;
  let applyGroupDiscount = false;

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const neighboringRequest = await db.serviceRequest.findFirst({
    where: {
      serviceAreaId: d.serviceAreaId,
      createdAt: { gte: yesterday },
      status: { in: ["SUBMITTED", "MATCHING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
      deletedAt: null,
    },
    select: { id: true, groupId: true },
  });

  if (neighboringRequest) {
    applyGroupDiscount = true;
    if (neighboringRequest.groupId) {
      targetGroupId = neighboringRequest.groupId;
    } else {
      targetGroupId = `grp_${Math.random().toString(36).substring(2, 10)}`;
      // Update neighboring request to join the group
      await db.serviceRequest.update({
        where: { id: neighboringRequest.id },
        data: {
          groupId: targetGroupId,
          groupDiscountApplied: true,
        },
      });
    }
  }

  const request = await db.serviceRequest.create({
    data: {
      customerId: session.user.id,
      categoryId: d.categoryId,
      subserviceId: d.subserviceId,
      serviceAreaId: d.serviceAreaId,
      title: d.title,
      description: d.description,
      locality: area?.name,
      addressLine: d.addressLine,
      landmark: d.landmark || null,
      voiceNoteUrl: d.voiceNoteUrl || null,
      groupId: targetGroupId,
      groupDiscountApplied: applyGroupDiscount,
      preferredDate: d.preferredDate ? new Date(d.preferredDate) : null,
      preferredTime: d.preferredTime || null,
      urgency: d.urgency,
      contactPreference: d.contactPreference,
      budgetMin: d.budgetMin ? parseInt(d.budgetMin, 10) : null,
      budgetMax: d.budgetMax ? parseInt(d.budgetMax, 10) : null,
      phone: d.phone,
      alternatePhone: d.alternatePhone || null,
      latitude: d.latitude || null,
      longitude: d.longitude || null,
      status: d.providerId ? "ASSIGNED" : "SUBMITTED",
      assignments: d.providerId
        ? {
            create: {
              providerId: d.providerId,
              status: "PENDING",
              source: "CUSTOMER",
            },
          }
        : undefined,
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: d.providerId ? "ASSIGNED" : "SUBMITTED",
          changedById: session.user.id,
          note: d.providerId
            ? "Direct booking request submitted by customer for provider"
            : applyGroupDiscount
            ? "Request submitted by customer (Neighborhood Group Booking discount applied)"
            : "Request submitted by customer",
        },
      },
    },
  });

  // 🔁 Immediately run auto-matcher ONLY if it's not a direct booking
  if (!d.providerId) {
    runMatcherForRequest(request.id, session.user.id).catch((err) => {
      console.error("[matcher] Error running initial match for request", request.id, err);
    });
  }

  return NextResponse.json({ id: request.id }, { status: 201 });
}
