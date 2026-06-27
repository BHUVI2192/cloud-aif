import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  legalName: z.string().min(1),
  displayName: z.string().min(1),
  businessName: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  experienceYears: z.number().min(0),
  languages: z.array(z.string()),
  serviceRadiusKm: z.number().nullable().optional(),
  primaryCategoryId: z.string().min(1),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
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

  const data = parsed.data;

  // Calculate completeness score (rough calculation based on fields completed)
  let score = 20; // base score for registration
  if (data.legalName) score += 10;
  if (data.displayName) score += 10;
  if (data.headline) score += 10;
  if (data.bio) score += 20;
  if (data.experienceYears > 0) score += 10;
  if (data.languages.length > 0) score += 10;
  if (data.serviceRadiusKm) score += 10;

  await db.$transaction(async (tx) => {
    await tx.providerProfile.update({
      where: { id: provider.id },
      data: {
        legalName: data.legalName,
        displayName: data.displayName,
        businessName: data.businessName || null,
        headline: data.headline || null,
        bio: data.bio || null,
        experienceYears: data.experienceYears,
        languages: data.languages,
        serviceRadiusKm: data.serviceRadiusKm || null,
        primaryCategoryId: data.primaryCategoryId,
        completenessScore: score,
      },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: { phone: data.phone },
    });
  });

  return NextResponse.json({ ok: true });
}
