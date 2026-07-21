import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { runMatcherForRequest, checkRequestRateLimit } from "@/lib/matcher";
import { waitUntil } from "@vercel/functions";
import { withTiming, createTimedResponse } from "@/lib/timing";

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

  const { result, durationMs } = await withTiming(async () => {
    const body = await req.json();

    // Honeypot check (zero-cost bot filter)
    if (body._hp && body._hp.length > 0) {
      return { response: NextResponse.json({ id: "ok" }, { status: 201 }) };
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return { response: NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 }) };
    }
    const d = parsed.data;

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Anti-spam & area validation & neighborhood grouping parallel lookup
    const [rateCheck, area, neighboringRequest] = await Promise.all([
      checkRequestRateLimit(session.user.id, d.categoryId),
      db.serviceArea.findUnique({ where: { id: d.serviceAreaId }, select: { id: true, name: true } }),
      db.serviceRequest.findFirst({
        where: {
          serviceAreaId: d.serviceAreaId,
          createdAt: { gte: yesterday },
          status: { in: ["SUBMITTED", "MATCHING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"] },
          deletedAt: null,
        },
        select: { id: true, groupId: true },
      }),
    ]);

    if (!rateCheck.allowed) {
      return { response: NextResponse.json({ error: rateCheck.reason }, { status: 429 }) };
    }
    if (!area) {
      return { response: NextResponse.json({ error: "Invalid service area" }, { status: 400 }) };
    }

    // Auto-matching & Neighborhood Discount Clustered Grouping
    let targetGroupId: string | null = null;
    let applyGroupDiscount = false;

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
        subserviceId: d.subserviceId || null,
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

    // 🔁 Safely dispatch auto-matcher in background context (non-blocking for serverless & queues)
    if (!d.providerId) {
      if (process.env.QSTASH_TOKEN && process.env.NEXT_PUBLIC_APP_URL) {
        const secret = process.env.INTERNAL_SYSTEM_SECRET || "dev_secret";
        fetch(`https://qstash.upstash.io/v2/publish/${process.env.NEXT_PUBLIC_APP_URL}/api/system/auto-assign`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
            "Content-Type": "application/json",
            "Upstash-Forward-Authorization": `Bearer ${secret}`,
          },
          body: JSON.stringify({ requestId: request.id, userId: session.user.id }),
        }).catch((err) => console.error("[QStash Publish Error]:", err));
      } else {
        waitUntil(
          runMatcherForRequest(request.id, session.user.id).catch((err) => {
            console.error("[matcher] Error running background match for request", request.id, err);
          })
        );
      }
    }

    return { data: { id: request.id }, status: 201 };
  });

  if (result.response) return result.response;
  return createTimedResponse(result.data, durationMs, session.user.role, result.status || 201);
}
