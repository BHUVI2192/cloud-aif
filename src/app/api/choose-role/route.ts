import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { role } = await req.json();
    if (role !== "CUSTOMER" && role !== "PROVIDER") {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if user already has a profile
    const [cust, prov] = await Promise.all([
      db.customerProfile.findUnique({ where: { userId } }),
      db.providerProfile.findUnique({ where: { userId } }),
    ]);

    if (cust || prov) {
      return NextResponse.json({ error: "Profile already exists for this user" }, { status: 400 });
    }

    const name = session.user.name || "User";

    await db.$transaction(async (tx) => {
      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role: role as UserRole },
      });

      if (role === "CUSTOMER") {
        await tx.customerProfile.create({
          data: {
            userId,
            displayName: name,
          },
        });
      } else {
        const baseSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const publicSlug = `${baseSlug || "provider"}-${Math.random().toString(36).substring(2, 7)}`;

        await tx.providerProfile.create({
          data: {
            userId,
            legalName: name,
            displayName: name,
            publicSlug,
            status: "DRAFT",
            experienceYears: 0,
            languages: [],
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Choose Role Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save role" }, { status: 500 });
  }
}
