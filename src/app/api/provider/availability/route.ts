import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { DayOfWeek, AvailabilityType } from "@prisma/client";

const slotSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
});

const schema = z.object({
  slots: z.array(slotSchema),
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

  const { slots } = parsed.data;

  await db.$transaction(async (tx) => {
    // Delete existing weekly recurring availability
    await tx.providerAvailability.deleteMany({
      where: {
        providerId: provider.id,
        type: "WEEKLY_RECURRING",
      },
    });

    // Create new weekly slots
    if (slots.length > 0) {
      await tx.providerAvailability.createMany({
        data: slots.map((s) => ({
          providerId: provider.id,
          type: "WEEKLY_RECURRING" as AvailabilityType,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isAvailable: true,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
