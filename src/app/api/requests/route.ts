import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  categoryId: z.string().min(1),
  subserviceId: z.string().min(1).optional(),
  title: z.string().min(4),
  description: z.string().min(10),
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
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const d = parsed.data;

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
        create: { fromStatus: null, toStatus: "SUBMITTED", changedById: session.user.id, note: "Request submitted by customer" },
      },
    },
  });

  return NextResponse.json({ id: request.id }, { status: 201 });
}
