import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { PricingUnit } from "@prisma/client";

const pricingItemSchema = z.object({
  label: z.string().min(1),
  unit: z.nativeEnum(PricingUnit),
  amountMin: z.number().min(0),
  amountMax: z.number().min(0).nullable().optional(),
  subserviceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const schema = z.object({
  pricing: z.array(pricingItemSchema),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const provider = await db.providerProfile.findUnique({ where: { userId: session.user.id } });
  if (!provider) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { pricing } = parsed.data;

  await db.$transaction(async (tx) => {
    // 1. Delete all existing pricing items
    await tx.providerPricing.deleteMany({
      where: { providerId: provider.id },
    });

    // 2. Insert new pricing items
    if (pricing.length > 0) {
      await tx.providerPricing.createMany({
        data: pricing.map((p) => ({
          providerId: provider.id,
          label: p.label,
          unit: p.unit,
          amountMin: p.amountMin * 100, // convert to paise
          amountMax: p.amountMax ? p.amountMax * 100 : null,
          subserviceId: p.subserviceId || null,
          notes: p.notes || null,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
