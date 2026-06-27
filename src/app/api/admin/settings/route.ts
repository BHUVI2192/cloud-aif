import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.record(z.string(), z.string());

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updates = parsed.data;

  await db.$transaction(async (tx) => {
    for (const [key, value] of Object.entries(updates)) {
      const setting = await tx.platformSetting.findUnique({ where: { key } });
      if (setting) {
        await tx.platformSetting.update({
          where: { key },
          data: { value },
        });

        // Log the admin action
        await tx.adminActionLog.create({
          data: {
            actorId: session.user.id,
            action: "SETTING_UPDATED",
            targetEntityType: "PlatformSetting",
            targetEntityId: setting.id,
            summary: `Updated setting ${key} to: ${value}`,
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
