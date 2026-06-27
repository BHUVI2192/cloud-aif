import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  subserviceIds: z.array(z.string()),
  serviceAreaIds: z.array(z.string()),
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

  const { subserviceIds, serviceAreaIds } = parsed.data;

  // Find all category IDs matching the subservices to sync categories
  const subservices = await db.subservice.findMany({
    where: { id: { in: subserviceIds } },
    select: { categoryId: true },
  });
  const categoryIds = Array.from(new Set(subservices.map((s) => s.categoryId)));

  await db.$transaction(async (tx) => {
    // 1. Delete all existing subservices for this provider
    await tx.providerSubservice.deleteMany({
      where: { providerId: provider.id },
    });

    // 2. Insert new subservices
    if (subserviceIds.length > 0) {
      await tx.providerSubservice.createMany({
        data: subserviceIds.map((subserviceId) => ({
          providerId: provider.id,
          subserviceId,
        })),
      });
    }

    // 3. Delete existing categories
    await tx.providerCategory.deleteMany({
      where: { providerId: provider.id },
    });

    // 4. Insert categories
    if (categoryIds.length > 0) {
      await tx.providerCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          providerId: provider.id,
          categoryId,
        })),
      });
    }

    // 5. Delete existing service areas
    await tx.providerServiceArea.deleteMany({
      where: { providerId: provider.id },
    });

    // 6. Insert service areas
    if (serviceAreaIds.length > 0) {
      await tx.providerServiceArea.createMany({
        data: serviceAreaIds.map((serviceAreaId) => ({
          providerId: provider.id,
          serviceAreaId,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
