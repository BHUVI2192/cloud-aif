import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        customerProfile: {
          include: {
            addresses: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const address = user.customerProfile?.addresses?.[0] || null;

    return NextResponse.json({
      phone: user.phone || "",
      name: user.name || "",
      address: address ? {
        line1: address.line1,
        line2: address.line2 || "",
        locality: address.locality || "",
        pincode: address.pincode || "",
        latitude: address.latitude || 13.9299,
        longitude: address.longitude || 75.5681,
      } : null
    });
  } catch (error) {
    console.error("[default-address-api] Error:", error);
    return NextResponse.json({ error: "Failed to fetch default address" }, { status: 500 });
  }
}
