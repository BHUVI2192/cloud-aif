import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { runMatcherForRequest, checkRequestRateLimit } from "@/lib/matcher";

const schema = z.object({
  categoryId: z.string().min(1),
  subserviceId: z.string().min(1).optional(),
  title: z.string().min(4),
  description: z.string().min(20, "Please describe your requirement in at least 20 characters"),
  serviceAreaId: z.string().min(1),
  addressLine: z.string().optional(),
  preferredDate: z.string().optional(),
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
    // Silently accept but don't process — bot doesn't know it was caught
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
      preferredDate: d.preferredDate ? new Date(d.preferredDate) : null,
      urgency: d.urgency,
      contactPreference: d.contactPreference,
      budgetMin: d.budgetMin ? parseInt(d.budgetMin, 10) : null,
      budgetMax: d.budgetMax ? parseInt(d.budgetMax, 10) : null,
      phone: d.phone,
      alternatePhone: d.alternatePhone || null,
      latitude: d.latitude || null,
      longitude: d.longitude || null,
      status: "SUBMITTED",
      statusHistory: {
        create: {
          fromStatus: null,
          toStatus: "SUBMITTED",
          changedById: session.user.id,
          note: "Request submitted by customer",
        },
      },
    },
  });

  // 🔁 Immediately run auto-matcher — no admin needed
  // Fire-and-forget: don't block the response
  runMatcherForRequest(request.id, session.user.id).catch((err) => {
    console.error("[matcher] Error running initial match for request", request.id, err);
  });

  return NextResponse.json({ id: request.id }, { status: 201 });
}
